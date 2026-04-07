"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildV2World } from "@/lib/three/v2-world";

// ── Color palette (monochromatic — all one hue, H≈195°, cold phosphorescent) ─
// Background: pure black abyss.
// Structure (circuit + equipment): near-invisible dim steel-blue.
// Fluid / spikes / arcs: bright luminous cyan-white.
const COLOR_FLUID  = new THREE.Color(0x88d8ff); // bright fluid glow
const COLOR_STRUCT = new THREE.Color(0x2a5a7a); // dim circuit infrastructure
const COLOR_SPIKE  = new THREE.Color(0xaaeeff); // ferrofluid tip (near-white)
const COLOR_ARC    = new THREE.Color(0x66ccff); // arc signal pulse

// ── Structure shader (PCB floor + equipment silhouettes) ─────────────────────
// Static, dim — serves as spatial reference for the bright fluid.

const STRUCT_VERT = /* glsl */ `
  attribute float aBright;
  varying  float  vBright;
  varying  float  vDepth;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth  = -mv.z;
    vBright = aBright;
    gl_PointSize = clamp(90.0 / vDepth, 0.4, 2.2);
    gl_Position  = projectionMatrix * mv;
  }
`;

const STRUCT_FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uAppear;
  varying float vBright;
  varying float vDepth;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;

    float alpha = (1.0 - smoothstep(0.3, 0.5, d)) * vBright;
    float fog   = smoothstep(uFogNear, uFogFar, vDepth);
    alpha *= (1.0 - fog) * smoothstep(0.0, 0.9, uAppear);
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

// ── Fluid shader (morphing organic blobs) ────────────────────────────────────
// Each point drifts with its own phase/seed → elastic, magnetic-fluid quality.
// Points are bright at the core, soft at the edge — accumulates into a glow.

const FLUID_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aPhase;
  attribute float aSeed;
  varying  float  vDepth;
  varying  float  vBright;

  void main() {
    // Organic elastic drift — different frequency per axis for non-spherical motion
    float amp = 0.9;
    vec3 pos = vec3(
      position.x + sin(uTime * 0.62 + aPhase * 6.28 + position.z * 0.13) * amp,
      position.y + sin(uTime * 0.85 + aSeed  * 3.14) * amp * 0.28,
      position.z + cos(uTime * 0.51 + aPhase * 5.40 + position.x * 0.11) * amp
    );

    // Secondary slow 'magnetic pull' oscillation (blob-level breathing)
    float breathe = 1.0 + 0.07 * sin(uTime * 0.38 + aPhase * 2.0);
    pos.xz *= breathe;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vDepth  = -mv.z;
    vBright = 0.65 + 0.35 * abs(sin(uTime * 0.44 + aPhase * 3.0));

    gl_PointSize = clamp(650.0 / vDepth, 1.0, 8.0);
    gl_Position  = projectionMatrix * mv;
  }
`;

const FLUID_FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uAppear;
  varying float vDepth;
  varying float vBright;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;

    // Soft radial falloff — accumulates to a glow when many points overlap
    float alpha = pow(1.0 - d * 2.0, 2.5) * 0.85;
    float fog   = smoothstep(uFogNear, uFogFar, vDepth);
    alpha *= (1.0 - fog) * vBright * smoothstep(0.0, 1.2, uAppear);
    if (alpha < 0.005) discard;

    // Slightly over-bright core creates the luminous mercury look
    gl_FragColor = vec4(uColor * (1.3 + vBright * 0.5), alpha);
  }
`;

// ── Ferrofluid spike shader ───────────────────────────────────────────────────
// aT: 0 (base) → 1 (tip). Tip height is animated, base stays fixed.
// Brightness quadratic in aT so tips are bright, bases nearly invisible.

const SPIKE_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aT;
  attribute float aFreq;
  attribute float aPhase;
  attribute float aMaxH;
  varying  float  vT;
  varying  float  vDepth;

  void main() {
    // Spike height pulses — ferrofluid responding to magnetic field strength
    float anim = 0.35 + 0.65 * abs(sin(uTime * aFreq + aPhase));
    float h    = aMaxH * anim;

    vec3 pos   = vec3(position.x, position.y + aT * h, position.z);
    vec4 mv    = modelViewMatrix * vec4(pos, 1.0);
    vDepth     = -mv.z;
    vT         = aT;

    gl_PointSize = clamp(200.0 / vDepth, 0.4, 3.5);
    gl_Position  = projectionMatrix * mv;
  }
`;

const SPIKE_FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uAppear;
  varying float vT;
  varying float vDepth;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;

    float tip    = vT * vT;                        // 0 at base, 1 at tip
    float alpha  = (1.0 - smoothstep(0.25, 0.5, d)) * tip;
    float fog    = smoothstep(uFogNear, uFogFar, vDepth);
    alpha *= (1.0 - fog) * smoothstep(0.0, 1.0, uAppear);
    if (alpha < 0.005) discard;

    gl_FragColor = vec4(uColor * (0.7 + tip * 1.3), alpha * 0.88);
  }
`;

// ── Arc (field line) shader ───────────────────────────────────────────────────
// A bright pulse travels along each arc — like a signal propagating through
// an energy conduit. Base glow remains dim between pulses.

const ARC_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aT;
  attribute float aSpeed;
  attribute float aPhase;
  varying  float  vBrightness;

  void main() {
    float flow = fract(uTime * aSpeed + aPhase);
    float dist = abs(aT - flow);
    dist = min(dist, 1.0 - dist);              // wrap-around
    float pulse = 1.0 - smoothstep(0.0, 0.12, dist);
    vBrightness = 0.06 + pulse * 0.94;         // dim base + bright pulse

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ARC_FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform float uAppear;
  varying float vBrightness;

  void main() {
    float alpha = vBrightness * smoothstep(0.1, 1.0, uAppear);
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(uColor * (0.9 + vBrightness * 0.8), alpha * 0.75);
  }
`;

// ── Scroll camera (same system as v1) ────────────────────────────────────────

const START = { x: 0, y: 15, z: 55, yaw: 0.0, pitch: 0.12 };
const WAYPOINTS = [
  { x: 28,  y: 9,   z: 18,  yaw: -0.28, pitch:  0.18, dur: 22 }, // About
  { x: 10,  y: 2.5, z: -5,  yaw:  0.35, pitch: -0.04, dur: 22 }, // Projects (ground)
  { x: -12, y: 20,  z: -25, yaw:  0.22, pitch:  0.38, dur: 21 }, // Skills (risen)
  { x: -5,  y: 10,  z: -50, yaw: -0.06, pitch:  0.04, dur: 20 }, // Contact
  { x: 0,   y: 12,  z: -65, yaw:  0.00, pitch:  0.05, dur: 15 }, // End
];

// ── Component ─────────────────────────────────────────────────────────────────

interface MorphicWorldProps {
  onLockChange?: (locked: boolean) => void;
}

export function MorphicWorld({ onLockChange }: MorphicWorldProps) {
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

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(72, 1, 0.1, 320);
    camera.rotation.order = "YXZ";
    camera.position.set(START.x, START.y, START.z);
    camera.rotation.y = START.yaw;
    camera.rotation.x = START.pitch;

    const FOG_NEAR = 40.0;
    const FOG_FAR  = 125.0;

    // ── Build world ───────────────────────────────────────────────
    const world = buildV2World(42);

    // ── Structure layer (circuit + equipment) ─────────────────────
    const structMat = new THREE.ShaderMaterial({
      vertexShader:   STRUCT_VERT,
      fragmentShader: STRUCT_FRAG,
      uniforms: {
        uColor:   { value: COLOR_STRUCT },
        uFogNear: { value: FOG_NEAR },
        uFogFar:  { value: FOG_FAR  },
        uAppear:  { value: 0.0 },
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });

    const structGeo = new THREE.BufferGeometry();
    structGeo.setAttribute("position", new THREE.BufferAttribute(world.structure.positions,  3));
    structGeo.setAttribute("aBright",  new THREE.BufferAttribute(world.structure.brightness, 1));
    scene.add(new THREE.Points(structGeo, structMat));

    // ── Fluid layer ───────────────────────────────────────────────
    const fluidMat = new THREE.ShaderMaterial({
      vertexShader:   FLUID_VERT,
      fragmentShader: FLUID_FRAG,
      uniforms: {
        uColor:   { value: COLOR_FLUID },
        uFogNear: { value: FOG_NEAR },
        uFogFar:  { value: FOG_FAR  },
        uTime:    { value: 0.0 },
        uAppear:  { value: 0.0 },
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });

    const fluidGeo = new THREE.BufferGeometry();
    fluidGeo.setAttribute("position", new THREE.BufferAttribute(world.fluid.positions, 3));
    fluidGeo.setAttribute("aPhase",   new THREE.BufferAttribute(world.fluid.phases,    1));
    fluidGeo.setAttribute("aSeed",    new THREE.BufferAttribute(world.fluid.seeds,     1));
    scene.add(new THREE.Points(fluidGeo, fluidMat));

    // ── Ferrofluid spike layer ────────────────────────────────────
    const spikeMat = new THREE.ShaderMaterial({
      vertexShader:   SPIKE_VERT,
      fragmentShader: SPIKE_FRAG,
      uniforms: {
        uColor:   { value: COLOR_SPIKE },
        uFogNear: { value: FOG_NEAR },
        uFogFar:  { value: FOG_FAR  },
        uTime:    { value: 0.0 },
        uAppear:  { value: 0.0 },
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });

    const spikeGeo = new THREE.BufferGeometry();
    spikeGeo.setAttribute("position", new THREE.BufferAttribute(world.spikes.positions, 3));
    spikeGeo.setAttribute("aT",       new THREE.BufferAttribute(world.spikes.ts,        1));
    spikeGeo.setAttribute("aFreq",    new THREE.BufferAttribute(world.spikes.freqs,     1));
    spikeGeo.setAttribute("aPhase",   new THREE.BufferAttribute(world.spikes.phases,    1));
    spikeGeo.setAttribute("aMaxH",    new THREE.BufferAttribute(world.spikes.maxH,      1));
    scene.add(new THREE.Points(spikeGeo, spikeMat));

    // ── Arc / field-line layer ────────────────────────────────────
    // One shared material; per-arc data encoded as vertex attributes.
    const arcMat = new THREE.ShaderMaterial({
      vertexShader:   ARC_VERT,
      fragmentShader: ARC_FRAG,
      uniforms: {
        uColor:  { value: COLOR_ARC },
        uTime:   { value: 0.0 },
        uAppear: { value: 0.0 },
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });

    const arcGeos: THREE.BufferGeometry[] = [];
    for (const arc of world.arcs) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(arc.positions, 3));
      geo.setAttribute("aT",       new THREE.BufferAttribute(arc.ts,        1));
      geo.setAttribute("aSpeed",   new THREE.BufferAttribute(arc.speeds,    1));
      geo.setAttribute("aPhase",   new THREE.BufferAttribute(arc.phases,    1));
      scene.add(new THREE.Line(geo, arcMat));
      arcGeos.push(geo);
    }

    // ── Size sync ────────────────────────────────────────────────
    const syncSize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    syncSize();

    // ── Scroll-driven camera ─────────────────────────────────────
    const cam = { ...START };

    const scrollTl = gsap.timeline({
      scrollTrigger: {
        id:    "morphic-camera",
        start: 0,
        end:   "max",
        scrub: true,
      },
    });

    WAYPOINTS.forEach(({ x, y, z, yaw, pitch, dur }) => {
      scrollTl.to(cam, { x, y, z, yaw, pitch, ease: "power1.inOut", duration: dur });
    });

    // ── Pointer-lock / WASD ───────────────────────────────────────
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
      if (e.code === "KeyW" || e.code === "ArrowUp"   ) keys.w = true;
      if (e.code === "KeyS" || e.code === "ArrowDown" ) keys.s = true;
      if (e.code === "KeyA" || e.code === "ArrowLeft" ) keys.a = true;
      if (e.code === "KeyD" || e.code === "ArrowRight") keys.d = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp"   ) keys.w = false;
      if (e.code === "KeyS" || e.code === "ArrowDown" ) keys.s = false;
      if (e.code === "KeyA" || e.code === "ArrowLeft" ) keys.a = false;
      if (e.code === "KeyD" || e.code === "ArrowRight") keys.d = false;
    };

    const onClick = () => { if (!isLocked) canvas.requestPointerLock(); };

    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("mousemove",         onMouseMove);
    document.addEventListener("keydown",           onKeyDown);
    document.addEventListener("keyup",             onKeyUp);
    canvas.addEventListener("click",               onClick);

    // ── Animation loop ───────────────────────────────────────────
    const timer  = new THREE.Timer();
    let appear   = 0.0;
    let rafId: number;

    const animate = (timestamp: number) => {
      rafId = requestAnimationFrame(animate);
      timer.update(timestamp);
      const delta   = timer.getDelta();
      const elapsed = timer.getElapsed();

      // Gradual reveal (slightly slower than v1 since there is more to see)
      appear = Math.min(1.0, appear + delta / 3.0);

      structMat.uniforms.uAppear.value = appear;

      fluidMat.uniforms.uTime.value   = elapsed;
      fluidMat.uniforms.uAppear.value = appear;

      spikeMat.uniforms.uTime.value   = elapsed;
      spikeMat.uniforms.uAppear.value = appear;

      arcMat.uniforms.uTime.value   = elapsed;
      arcMat.uniforms.uAppear.value = appear;

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
        camera.position.y = Math.max(1.5, camera.position.y);
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

      ScrollTrigger.getById("morphic-camera")?.kill();
      scrollTl.kill();

      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("mousemove",         onMouseMove);
      document.removeEventListener("keydown",           onKeyDown);
      document.removeEventListener("keyup",             onKeyUp);
      canvas.removeEventListener("click",               onClick);

      if (document.pointerLockElement === canvas) document.exitPointerLock();

      structGeo.dispose();
      structMat.dispose();
      fluidGeo.dispose();
      fluidMat.dispose();
      spikeGeo.dispose();
      spikeMat.dispose();
      arcGeos.forEach(g => g.dispose());
      arcMat.dispose();
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
