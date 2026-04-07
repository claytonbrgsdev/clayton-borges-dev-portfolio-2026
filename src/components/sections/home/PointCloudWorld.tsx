"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildWorld } from "@/lib/three/world-geometry";
import {
  buildClusters,
  buildOscilloscopeTraces,
} from "@/lib/three/energy-geometry";

// ── Terrain shaders ───────────────────────────────────────────────────────────

const TERRAIN_VERT = /* glsl */ `
  uniform float uSize;
  uniform float uViewH;
  uniform float uTime;
  varying float vDepth;
  varying float vHeight;

  void main() {
    float h = clamp(position.y / 25.0, 0.0, 1.0);
    // Reduced amplitude so scan-line striations stay readable.
    // Higher terrain features breathe more; seafloor is nearly static.
    float wave =
      sin(position.x * 0.08  + uTime * 0.25) * 0.18 +
      sin(position.z * 0.07  - uTime * 0.20) * 0.15 +
      sin((position.x + position.z * 0.6) * 0.11 + uTime * 0.33) * 0.10;
    wave *= (0.06 + h * 0.22);

    vec3 pos = vec3(position.x, position.y + wave, position.z);
    vec4 mv  = modelViewMatrix * vec4(pos, 1.0);

    // Smaller max point size — makes individual scan dots visible at distance
    gl_PointSize = clamp(uSize * uViewH / (-mv.z * 0.9), 0.5, 3.5);
    gl_Position  = projectionMatrix * mv;
    vDepth  = -mv.z;
    vHeight = position.y; // original Y before wave (for depth shading)
  }
`;

const TERRAIN_FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uAppear;
  varying float vDepth;
  varying float vHeight;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;

    float alpha = 1.0 - smoothstep(0.3, 0.5, d);
    float fog   = smoothstep(uFogNear, uFogFar, vDepth);
    alpha *= (1.0 - fog);

    float depthFrac = clamp(vDepth / uFogFar, 0.0, 1.0);
    alpha *= smoothstep(depthFrac - 0.20, depthFrac + 0.10, uAppear);

    if (alpha < 0.01) discard;

    // Height-based brightness: seafloor dim, ridges/peaks bright.
    // Mimics the depth-return intensity falloff of real sonar.
    float bright = 0.45 + 0.55 * clamp(vHeight / 22.0, 0.0, 1.0);
    gl_FragColor = vec4(uColor * bright, alpha);
  }
`;

// ── Cluster shaders ───────────────────────────────────────────────────────────
// Clusters breathe — the entire node expands and contracts as one living thing.

const CLUSTER_VERT = /* glsl */ `
  uniform float uTime;
  attribute vec3  aNodeCenter;
  attribute vec3  aColor;
  attribute float aBreathFreq;
  attribute float aBreathOffset;
  varying vec3  vColor;
  varying float vDepth;

  void main() {
    float breath = 1.0 + 0.065 * sin(uTime * aBreathFreq + aBreathOffset);
    vec3 offset  = position - aNodeCenter;
    vec3 pos     = aNodeCenter + offset * breath;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    vDepth = -mvPos.z;
    vColor = aColor;

    gl_PointSize = clamp(520.0 / vDepth, 1.0, 5.5);
    gl_Position  = projectionMatrix * mvPos;
  }
`;

const CLUSTER_FRAG = /* glsl */ `
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uAppear;
  varying vec3  vColor;
  varying float vDepth;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;

    float alpha = 1.0 - smoothstep(0.2, 0.5, d);
    float fog   = smoothstep(uFogNear, uFogFar, vDepth);
    alpha *= (1.0 - fog);

    // Energy layer appears after the terrain — delayed reveal
    alpha *= smoothstep(0.25, 0.85, uAppear);

    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor * 2.0, alpha * 0.85);
  }
`;

// ── Oscilloscope trace shaders ────────────────────────────────────────────────
// Lissajous figures in 3D — each trace is a different harmonic relationship
// between two oscillation axes perpendicular to the edge direction.
// The brightness fluctuates like a signal breathing.

const TRACE_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aT;
  attribute float aFreqA;
  attribute float aFreqB;
  attribute float aPhaseA;
  attribute float aPhaseB;
  attribute float aHarmonic;
  attribute float aAmp;
  attribute vec3  aNormal;
  attribute vec3  aBinormal;
  attribute vec3  aColorA;
  attribute vec3  aColorB;
  varying vec3  vColor;
  varying float vBrightness;

  void main() {
    float turns = aHarmonic * 6.28318;
    float oscA  = sin(aFreqA * uTime + aPhaseA + aT * turns);
    float oscB  = cos(aFreqB * uTime + aPhaseB + aT * turns * 0.618);

    vec3 displaced = position + aAmp * (oscA * aNormal + oscB * aBinormal);

    vColor      = mix(aColorA, aColorB, aT);
    vBrightness = 0.5 + 0.5 * abs(sin(uTime * 1.7 + aPhaseA + aT * 3.14159));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const TRACE_FRAG = /* glsl */ `
  uniform float uAppear;
  varying vec3  vColor;
  varying float vBrightness;

  void main() {
    float alpha = vBrightness * smoothstep(0.2, 0.75, uAppear);
    if (alpha < 0.01) discard;
    // Traces are the brightest elements — they cut through the point cloud
    gl_FragColor = vec4(vColor * (1.2 + vBrightness * 0.9), alpha);
  }
`;

// ── Scroll-driven camera waypoints ────────────────────────────────────────────

const START = { x: 0,   y: 12, z: 50,  yaw:  0.00, pitch:  0.08 };
const WAYPOINTS = [
  { x: 25,  y: 6,   z: 20,  yaw: -0.30, pitch:  0.20, dur: 22 }, // About
  { x: 15,  y: 3.5, z: -10, yaw:  0.40, pitch: -0.05, dur: 22 }, // Projects
  { x: -10, y: 18,  z: -25, yaw:  0.20, pitch:  0.35, dur: 21 }, // Skills
  { x: -5,  y: 9,   z: -50, yaw: -0.05, pitch:  0.02, dur: 20 }, // Contact
  { x: 0,   y: 10,  z: -65, yaw:  0.00, pitch:  0.04, dur: 15 }, // End
];

// ── Component ─────────────────────────────────────────────────────────────────

interface PointCloudWorldProps {
  onLockChange?: (locked: boolean) => void;
}

export function PointCloudWorld({ onLockChange }: PointCloudWorldProps) {
  const containerRef    = useRef<HTMLDivElement>(null);
  const lockCallbackRef = useRef(onLockChange);
  lockCallbackRef.current = onLockChange;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    gsap.registerPlugin(ScrollTrigger);

    // ── Renderer ─────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    // ── Scene / camera ───────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 350);
    camera.rotation.order = "YXZ";
    camera.position.set(START.x, START.y, START.z);
    camera.rotation.y = START.yaw;
    camera.rotation.x = START.pitch;

    // ── Fog / shared uniforms ────────────────────────────────────
    const FOG_NEAR = 45.0;
    const FOG_FAR  = 135.0;

    // ── Terrain layer ─────────────────────────────────────────────
    const terrainMat = new THREE.ShaderMaterial({
      vertexShader:   TERRAIN_VERT,
      fragmentShader: TERRAIN_FRAG,
      uniforms: {
        uColor:   { value: new THREE.Color(0x00bbdd) },
        uFogNear: { value: FOG_NEAR },
        uFogFar:  { value: FOG_FAR  },
        uSize:    { value: 1.2 },
        uViewH:   { value: container.clientHeight },
        uTime:    { value: 0.0 },
        uAppear:  { value: 0.0 },
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });

    const { positions: terrainPos } = buildWorld(42);
    const terrainGeo = new THREE.BufferGeometry();
    terrainGeo.setAttribute("position", new THREE.BufferAttribute(terrainPos, 3));
    scene.add(new THREE.Points(terrainGeo, terrainMat));

    // ── Energy layer — cluster halos ──────────────────────────────
    const clusterData = buildClusters(9001);
    const clusterMat  = new THREE.ShaderMaterial({
      vertexShader:   CLUSTER_VERT,
      fragmentShader: CLUSTER_FRAG,
      uniforms: {
        uTime:    { value: 0.0 },
        uFogNear: { value: FOG_NEAR },
        uFogFar:  { value: FOG_FAR  },
        uAppear:  { value: 0.0 },
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });

    const clusterGeo = new THREE.BufferGeometry();
    clusterGeo.setAttribute("position",     new THREE.BufferAttribute(clusterData.positions,     3));
    clusterGeo.setAttribute("aNodeCenter",  new THREE.BufferAttribute(clusterData.nodeCenters,   3));
    clusterGeo.setAttribute("aColor",       new THREE.BufferAttribute(clusterData.colors,        3));
    clusterGeo.setAttribute("aBreathFreq",  new THREE.BufferAttribute(clusterData.breathFreqs,   1));
    clusterGeo.setAttribute("aBreathOffset",new THREE.BufferAttribute(clusterData.breathOffsets, 1));
    scene.add(new THREE.Points(clusterGeo, clusterMat));

    // ── Energy layer — oscilloscope traces ────────────────────────
    // One shared ShaderMaterial; per-edge color/frequency data lives in vertex attributes.
    const traceMat = new THREE.ShaderMaterial({
      vertexShader:   TRACE_VERT,
      fragmentShader: TRACE_FRAG,
      uniforms: {
        uTime:   { value: 0.0 },
        uAppear: { value: 0.0 },
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });

    const traceEdges = buildOscilloscopeTraces(7777);
    const traceGeos: THREE.BufferGeometry[] = [];

    for (const ed of traceEdges) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position",  new THREE.BufferAttribute(ed.positions, 3));
      geo.setAttribute("aNormal",   new THREE.BufferAttribute(ed.normals,   3));
      geo.setAttribute("aBinormal", new THREE.BufferAttribute(ed.binormals, 3));
      geo.setAttribute("aT",        new THREE.BufferAttribute(ed.ts,        1));
      geo.setAttribute("aFreqA",    new THREE.BufferAttribute(ed.freqsA,    1));
      geo.setAttribute("aFreqB",    new THREE.BufferAttribute(ed.freqsB,    1));
      geo.setAttribute("aPhaseA",   new THREE.BufferAttribute(ed.phasesA,   1));
      geo.setAttribute("aPhaseB",   new THREE.BufferAttribute(ed.phasesB,   1));
      geo.setAttribute("aHarmonic", new THREE.BufferAttribute(ed.harmonics, 1));
      geo.setAttribute("aAmp",      new THREE.BufferAttribute(ed.amps,      1));
      geo.setAttribute("aColorA",   new THREE.BufferAttribute(ed.colorsA,   3));
      geo.setAttribute("aColorB",   new THREE.BufferAttribute(ed.colorsB,   3));
      scene.add(new THREE.Line(geo, traceMat));
      traceGeos.push(geo);
    }

    // ── Size sync ────────────────────────────────────────────────
    const syncSize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      terrainMat.uniforms.uViewH.value = h;
    };

    syncSize();

    // ── Scroll-driven camera ─────────────────────────────────────
    const cam = { ...START };

    const scrollTl = gsap.timeline({
      scrollTrigger: {
        id: "world-camera",
        start: 0,
        end: "max",
        scrub: true,
      },
    });

    WAYPOINTS.forEach(({ x, y, z, yaw, pitch, dur }) => {
      scrollTl.to(cam, { x, y, z, yaw, pitch, ease: "power1.inOut", duration: dur });
    });

    // ── Pointer-lock / WASD state ────────────────────────────────
    let isLocked  = false;
    let userYaw   = START.yaw;
    let userPitch = START.pitch;
    const keys    = { w: false, a: false, s: false, d: false };

    const velocity = new THREE.Vector3();
    const hForward = new THREE.Vector3();
    const hRight   = new THREE.Vector3();
    const moveVec  = new THREE.Vector3();
    const worldUp  = new THREE.Vector3(0, 1, 0);

    const SPEED   = 14;
    const DAMPING = 0.82;
    const canvas  = renderer.domElement;

    const onPointerLockChange = () => {
      isLocked = document.pointerLockElement === canvas;
      if (isLocked) {
        userYaw   = cam.yaw;
        userPitch = cam.pitch;
        velocity.set(0, 0, 0);
      }
      lockCallbackRef.current?.(isLocked);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isLocked) return;
      userYaw   -= e.movementX * 0.0022;
      userPitch -= e.movementY * 0.0022;
      userPitch  = Math.max(-Math.PI / 2 + 0.06, Math.min(Math.PI / 2 - 0.06, userPitch));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isLocked) return;
      if (e.code === "KeyW"    || e.code === "ArrowUp"   ) keys.w = true;
      if (e.code === "KeyS"    || e.code === "ArrowDown" ) keys.s = true;
      if (e.code === "KeyA"    || e.code === "ArrowLeft" ) keys.a = true;
      if (e.code === "KeyD"    || e.code === "ArrowRight") keys.d = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW"    || e.code === "ArrowUp"   ) keys.w = false;
      if (e.code === "KeyS"    || e.code === "ArrowDown" ) keys.s = false;
      if (e.code === "KeyA"    || e.code === "ArrowLeft" ) keys.a = false;
      if (e.code === "KeyD"    || e.code === "ArrowRight") keys.d = false;
    };

    const onClick = () => { if (!isLocked) canvas.requestPointerLock(); };

    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("mousemove",         onMouseMove);
    document.addEventListener("keydown",           onKeyDown);
    document.addEventListener("keyup",             onKeyUp);
    canvas.addEventListener("click",               onClick);

    // ── Animation loop ───────────────────────────────────────────
    const timer = new THREE.Timer();
    let appear  = 0.0;
    let rafId: number;

    const animate = (timestamp: number) => {
      rafId = requestAnimationFrame(animate);
      timer.update(timestamp);
      const delta   = timer.getDelta();
      const elapsed = timer.getElapsed();

      // Terrain
      appear = Math.min(1.0, appear + delta / 2.5);
      terrainMat.uniforms.uTime.value   = elapsed;
      terrainMat.uniforms.uAppear.value  = appear;

      // Energy layer — all four materials share the same time + appear
      clusterMat.uniforms.uTime.value  = elapsed;
      clusterMat.uniforms.uAppear.value = appear;
      traceMat.uniforms.uTime.value    = elapsed;
      traceMat.uniforms.uAppear.value   = appear;

      // Camera
      if (isLocked) {
        camera.rotation.y = userYaw;
        camera.rotation.x = userPitch;

        hForward.set(-Math.sin(userYaw), 0, -Math.cos(userYaw));
        hRight.crossVectors(hForward, worldUp);

        moveVec.set(0, 0, 0);
        if (keys.w) moveVec.addScaledVector(hForward,  1);
        if (keys.s) moveVec.addScaledVector(hForward, -1);
        if (keys.a) moveVec.addScaledVector(hRight,   -1);
        if (keys.d) moveVec.addScaledVector(hRight,    1);
        if (moveVec.lengthSq() > 0) moveVec.normalize();

        velocity.addScaledVector(moveVec, SPEED * delta);
        velocity.multiplyScalar(DAMPING);
        camera.position.addScaledVector(velocity, 1);
        camera.position.y = Math.max(2.5, camera.position.y);
      } else {
        camera.position.set(cam.x, cam.y, cam.z);
        camera.rotation.y = cam.yaw;
        camera.rotation.x = cam.pitch;
      }

      renderer.render(scene, camera);
    };

    requestAnimationFrame(animate);

    // ── Resize ───────────────────────────────────────────────────
    const ro = new ResizeObserver(syncSize);
    ro.observe(container);

    // ── Cleanup ──────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();

      ScrollTrigger.getById("world-camera")?.kill();
      scrollTl.kill();

      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("mousemove",         onMouseMove);
      document.removeEventListener("keydown",           onKeyDown);
      document.removeEventListener("keyup",             onKeyUp);
      canvas.removeEventListener("click",               onClick);

      if (document.pointerLockElement === canvas) document.exitPointerLock();

      // Terrain
      terrainGeo.dispose();
      terrainMat.dispose();

      // Energy — clusters
      clusterGeo.dispose();
      clusterMat.dispose();

      // Energy — traces
      traceGeos.forEach(g => g.dispose());
      traceMat.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 cursor-crosshair"
      style={{ zIndex: 0 }}
    />
  );
}
