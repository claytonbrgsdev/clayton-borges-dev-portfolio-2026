"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { buildWorld } from "@/lib/three/world-geometry";
import { buildClusters, buildOscilloscopeTraces } from "@/lib/three/energy-geometry";
import { buildV2World } from "@/lib/three/v2-world";

// ── V1 shaders (verbatim from PointCloudWorld, uAppear fixed to 1.0) ─────────

const V1_TERRAIN_VERT = /* glsl */ `
  uniform float uSize;
  uniform float uViewH;
  uniform float uTime;
  varying float vDepth;
  varying float vHeight;
  void main() {
    float h = clamp(position.y / 25.0, 0.0, 1.0);
    float wave =
      sin(position.x * 0.08  + uTime * 0.25) * 0.18 +
      sin(position.z * 0.07  - uTime * 0.20) * 0.15 +
      sin((position.x + position.z * 0.6) * 0.11 + uTime * 0.33) * 0.10;
    wave *= (0.06 + h * 0.22);
    vec3 pos = vec3(position.x, position.y + wave, position.z);
    vec4 mv  = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = clamp(uSize * uViewH / (-mv.z * 0.9), 0.5, 3.5);
    gl_Position  = projectionMatrix * mv;
    vDepth  = -mv.z;
    vHeight = position.y;
  }
`;
const V1_TERRAIN_FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vDepth;
  varying float vHeight;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.3, 0.5, d);
    float fog   = smoothstep(uFogNear, uFogFar, vDepth);
    alpha *= (1.0 - fog);
    if (alpha < 0.01) discard;
    float bright = 0.45 + 0.55 * clamp(vHeight / 22.0, 0.0, 1.0);
    gl_FragColor = vec4(uColor * bright, alpha);
  }
`;
const V1_CLUSTER_VERT = /* glsl */ `
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
const V1_CLUSTER_FRAG = /* glsl */ `
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec3  vColor;
  varying float vDepth;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.2, 0.5, d);
    float fog   = smoothstep(uFogNear, uFogFar, vDepth);
    alpha *= (1.0 - fog);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor * 2.0, alpha * 0.85);
  }
`;
const V1_TRACE_VERT = /* glsl */ `
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
const V1_TRACE_FRAG = /* glsl */ `
  varying vec3  vColor;
  varying float vBrightness;
  void main() {
    float alpha = vBrightness;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor * (1.2 + vBrightness * 0.9), alpha);
  }
`;

// ── V2 shaders — Circuit Cathedral ────────────────────────────────────────────

// Slab surface (static dim circuit traces)
const V2_SLAB_VERT = /* glsl */ `
  attribute float aBright;
  varying  float  vBright;
  varying  float  vDepth;
  void main() {
    vec4 mv      = modelViewMatrix * vec4(position, 1.0);
    vDepth       = -mv.z;
    vBright      = aBright;
    gl_PointSize = clamp(220.0 / vDepth, 0.7, 5.0);
    gl_Position  = projectionMatrix * mv;
  }
`;
const V2_SLAB_FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vBright;
  varying float vDepth;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    if (length(uv) > 0.5) discard;
    float alpha = (1.0 - smoothstep(0.25, 0.5, length(uv))) * vBright;
    alpha *= (1.0 - smoothstep(uFogNear, uFogFar, vDepth));
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(uColor * (0.5 + vBright * 1.5), alpha);
  }
`;
// Plasma cascade — flows DOWN each slab face
const V2_CASCADE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSlabBottom;
  uniform float uSlabH;
  attribute float aSpeed;
  attribute float aPhase;
  varying  float  vBright;
  varying  float  vDepth;
  void main() {
    // flow=0 → top of slab (head), increases → moves down, wraps back to top
    float flow   = fract(aPhase - uTime * aSpeed * 0.11);
    float worldY = uSlabBottom + (1.0 - flow) * uSlabH;  // invert: head at top

    // Drip: bright at the leading edge (flow≈0), fading tail behind it
    float bright = pow(1.0 - flow, 2.2);
    // Extra bright drip-head just before next wrap
    bright += smoothstep(0.88, 1.0, flow) * 0.9;
    vBright = clamp(bright, 0.0, 1.4);

    vec3 pos     = vec3(position.x, worldY, position.z);
    vec4 mv      = modelViewMatrix * vec4(pos, 1.0);
    vDepth       = -mv.z;
    gl_PointSize = clamp(800.0 / vDepth, 1.0, 9.0);
    gl_Position  = projectionMatrix * mv;
  }
`;
const V2_CASCADE_FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vBright;
  varying float vDepth;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float alpha = pow(max(0.0, 1.0 - d * 2.0), 1.3) * 0.88 * vBright;
    alpha *= (1.0 - smoothstep(uFogNear, uFogFar, vDepth));
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(uColor * (1.2 + vBright * 1.1), alpha);
  }
`;

// ── V2 plasma animal shaders ──────────────────────────────────────────────────

const V2_PLASMA_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aPhase;
  attribute float aT;
  attribute float aSeed;
  attribute float aAnimalPhase;
  varying  float  vBright;
  varying  float  vDepth;
  varying  vec3   vColor;
  void main() {
    // Whole-body floating bob (geometry Y already places creature at correct height)
    float bob = sin(uTime * 0.22 + aAnimalPhase) * 2.2;

    // Gentle organic sway — preserves readable shape
    float driftX = sin(uTime * 0.72 + aPhase * 6.28 + position.z * 0.18) * 0.55
                 + sin(uTime * 0.40 + aSeed  * 3.50)                      * 0.18;
    float driftZ = cos(uTime * 0.62 + aPhase * 4.80 + position.x * 0.15)  * 0.42;
    float driftY = sin(uTime * 0.50 + aPhase * 2.20)                      * 0.18;

    vec3 pos = vec3(
      position.x + driftX,
      position.y + driftY + bob,
      position.z + driftZ
    );

    float heat  = 0.5 + 0.5 * abs(sin(uTime * 1.8 + aPhase * 4.0 + aT * 2.5));
    vBright = (0.60 + aT * 0.40) * (0.75 + heat * 0.50);

    vColor = mix(
      vec3(0.20, 0.80, 1.00),  // cold: phosphor cyan
      vec3(0.95, 0.90, 1.00),  // hot: white with violet
      clamp(aT * 0.6 + heat * 0.4, 0.0, 1.0)
    );

    vec4 mv      = modelViewMatrix * vec4(pos, 1.0);
    vDepth       = -mv.z;
    gl_PointSize = clamp(1400.0 / vDepth, 2.0, 22.0);
    gl_Position  = projectionMatrix * mv;
  }
`;
const V2_PLASMA_FRAG = /* glsl */ `
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vBright;
  varying float vDepth;
  varying vec3  vColor;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float alpha = pow(max(0.0, 1.0 - d * 1.9), 1.1) * 0.95 * vBright;
    alpha *= (1.0 - smoothstep(uFogNear, uFogFar, vDepth));
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(vColor * (1.4 + vBright * 1.0), alpha);
  }
`;

const V2_HAZE_VERT = /* glsl */ `
  attribute float aBright;
  varying  float  vBright;
  varying  float  vDepth;
  void main() {
    vec4 mv      = modelViewMatrix * vec4(position, 1.0);
    vDepth       = -mv.z;
    vBright      = aBright;
    gl_PointSize = clamp(90.0 / vDepth, 0.5, 1.8);
    gl_Position  = projectionMatrix * mv;
  }
`;
const V2_HAZE_FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vBright;
  varying float vDepth;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    if (length(uv) > 0.5) discard;
    float alpha = (1.0 - smoothstep(0.2, 0.5, length(uv))) * vBright;
    alpha *= (1.0 - smoothstep(uFogNear, uFogFar, vDepth));
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

// ── Scene bundle type ─────────────────────────────────────────────────────────

interface SceneBundle {
  timeMats: THREE.ShaderMaterial[]; // materials that need uTime updates
  dispose: () => void;
}

// ── V1 scene builder ──────────────────────────────────────────────────────────

function buildV1(scene: THREE.Scene): SceneBundle {
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.ShaderMaterial[] = [];
  const objs: THREE.Object3D[] = [];

  const add = (obj: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.ShaderMaterial) => {
    geos.push(geo); mats.push(mat); objs.push(obj); scene.add(obj);
  };

  const FOG_NEAR = 60, FOG_FAR = 280;

  // Terrain
  const terrainMat = new THREE.ShaderMaterial({
    vertexShader: V1_TERRAIN_VERT, fragmentShader: V1_TERRAIN_FRAG,
    uniforms: {
      uColor:   { value: new THREE.Color(0x00bbdd) },
      uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      uSize:    { value: 1.2 }, uViewH: { value: 800 },
      uTime:    { value: 0 },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const { positions: tp } = buildWorld(42);
  const terrainGeo = new THREE.BufferGeometry();
  terrainGeo.setAttribute("position", new THREE.BufferAttribute(tp, 3));
  add(new THREE.Points(terrainGeo, terrainMat), terrainGeo, terrainMat);

  // Clusters
  const clusterMat = new THREE.ShaderMaterial({
    vertexShader: V1_CLUSTER_VERT, fragmentShader: V1_CLUSTER_FRAG,
    uniforms: { uTime: { value: 0 }, uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const cd = buildClusters(9001);
  const clusterGeo = new THREE.BufferGeometry();
  clusterGeo.setAttribute("position",      new THREE.BufferAttribute(cd.positions,     3));
  clusterGeo.setAttribute("aNodeCenter",   new THREE.BufferAttribute(cd.nodeCenters,   3));
  clusterGeo.setAttribute("aColor",        new THREE.BufferAttribute(cd.colors,        3));
  clusterGeo.setAttribute("aBreathFreq",   new THREE.BufferAttribute(cd.breathFreqs,   1));
  clusterGeo.setAttribute("aBreathOffset", new THREE.BufferAttribute(cd.breathOffsets, 1));
  add(new THREE.Points(clusterGeo, clusterMat), clusterGeo, clusterMat);

  // Traces
  const traceMat = new THREE.ShaderMaterial({
    vertexShader: V1_TRACE_VERT, fragmentShader: V1_TRACE_FRAG,
    uniforms: { uTime: { value: 0 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const traceEdges = buildOscilloscopeTraces(7777);
  for (const ed of traceEdges) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position",  new THREE.BufferAttribute(ed.positions, 3));
    g.setAttribute("aNormal",   new THREE.BufferAttribute(ed.normals,   3));
    g.setAttribute("aBinormal", new THREE.BufferAttribute(ed.binormals, 3));
    g.setAttribute("aT",        new THREE.BufferAttribute(ed.ts,        1));
    g.setAttribute("aFreqA",    new THREE.BufferAttribute(ed.freqsA,    1));
    g.setAttribute("aFreqB",    new THREE.BufferAttribute(ed.freqsB,    1));
    g.setAttribute("aPhaseA",   new THREE.BufferAttribute(ed.phasesA,   1));
    g.setAttribute("aPhaseB",   new THREE.BufferAttribute(ed.phasesB,   1));
    g.setAttribute("aHarmonic", new THREE.BufferAttribute(ed.harmonics, 1));
    g.setAttribute("aAmp",      new THREE.BufferAttribute(ed.amps,      1));
    g.setAttribute("aColorA",   new THREE.BufferAttribute(ed.colorsA,   3));
    g.setAttribute("aColorB",   new THREE.BufferAttribute(ed.colorsB,   3));
    geos.push(g);
    const line = new THREE.Line(g, traceMat);
    objs.push(line);
    scene.add(line);
  }
  mats.push(traceMat);

  return {
    timeMats: mats,
    dispose: () => { objs.forEach(o => scene.remove(o)); geos.forEach(g => g.dispose()); mats.forEach(m => m.dispose()); },
  };
}

// ── V2 scene builder — Circuit Cathedral ─────────────────────────────────────

function buildV2(scene: THREE.Scene): SceneBundle {
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.ShaderMaterial[] = [];
  const objs: THREE.Object3D[] = [];

  const add = (obj: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.ShaderMaterial) => {
    geos.push(geo); mats.push(mat); objs.push(obj); scene.add(obj);
  };

  const FOG_NEAR = 55, FOG_FAR = 260;
  const world = buildV2World(42);

  // ── Slab surfaces (static circuit geometry) ────────────────────────────────
  const slabMat = new THREE.ShaderMaterial({
    vertexShader: V2_SLAB_VERT, fragmentShader: V2_SLAB_FRAG,
    uniforms: {
      uColor:   { value: new THREE.Color(0x336688) },
      uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  for (const slab of world.slabs) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(slab.positions,  3));
    g.setAttribute("aBright",  new THREE.BufferAttribute(slab.brightness, 1));
    geos.push(g);
    const pts = new THREE.Points(g, slabMat);
    objs.push(pts);
    scene.add(pts);
  }
  mats.push(slabMat); // no uTime, but add for uViewH sync if needed

  // ── Cascades (one ShaderMaterial per slab — needs per-slab uniforms) ───────
  for (const cascade of world.cascades) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: V2_CASCADE_VERT, fragmentShader: V2_CASCADE_FRAG,
      uniforms: {
        uColor:      { value: new THREE.Color(0x55eeff) },
        uFogNear:    { value: FOG_NEAR }, uFogFar:  { value: FOG_FAR },
        uTime:       { value: 0 },
        uSlabBottom: { value: cascade.slabBottom },
        uSlabH:      { value: cascade.slabH },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(cascade.positions, 3));
    g.setAttribute("aSpeed",   new THREE.BufferAttribute(cascade.speeds,    1));
    g.setAttribute("aPhase",   new THREE.BufferAttribute(cascade.phases,    1));
    add(new THREE.Points(g, mat), g, mat);
  }

  // ── Plasma animals ─────────────────────────────────────────────────────────
  const plasmaMat = new THREE.ShaderMaterial({
    vertexShader: V2_PLASMA_VERT, fragmentShader: V2_PLASMA_FRAG,
    uniforms: {
      uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      uTime:    { value: 0 },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const pa = world.plasmaAnimals;
  const paGeo = new THREE.BufferGeometry();
  paGeo.setAttribute("position",     new THREE.BufferAttribute(pa.positions,   3));
  paGeo.setAttribute("aPhase",       new THREE.BufferAttribute(pa.phases,      1));
  paGeo.setAttribute("aT",           new THREE.BufferAttribute(pa.ts,          1));
  paGeo.setAttribute("aSeed",        new THREE.BufferAttribute(pa.seeds,       1));
  paGeo.setAttribute("aAnimalPhase", new THREE.BufferAttribute(pa.animalPhase, 1));
  add(new THREE.Points(paGeo, plasmaMat), paGeo, plasmaMat);

  // ── Ambient haze ───────────────────────────────────────────────────────────
  const hazeMat = new THREE.ShaderMaterial({
    vertexShader: V2_HAZE_VERT, fragmentShader: V2_HAZE_FRAG,
    uniforms: {
      uColor:   { value: new THREE.Color(0x1a3344) },
      uFogNear: { value: FOG_NEAR * 0.5 }, uFogFar: { value: FOG_FAR },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const haze = world.ambientHaze;
  const hazeGeo = new THREE.BufferGeometry();
  hazeGeo.setAttribute("position", new THREE.BufferAttribute(haze.positions,  3));
  hazeGeo.setAttribute("aBright",  new THREE.BufferAttribute(haze.brightness, 1));
  add(new THREE.Points(hazeGeo, hazeMat), hazeGeo, hazeMat);

  return {
    timeMats: mats,
    dispose: () => { objs.forEach(o => scene.remove(o)); geos.forEach(g => g.dispose()); mats.forEach(m => m.dispose()); },
  };
}

// ── World definitions ─────────────────────────────────────────────────────────

const WORLDS = [
  {
    id:      "v1",
    label:   "v1 — Point Cloud World",
    desc:    "LiDAR terrain · icosahedron energy layer · sonar scan aesthetic",
    camPos:  [60, 30, 60]  as [number, number, number],
    target:  [0,  8, -10] as [number, number, number],
    build:   buildV1,
  },
  {
    id:      "v2",
    label:   "v2 — Circuit Cathedral",
    desc:    "Towering circuit monoliths · plasma cascade waterfalls · drifting plasma creatures",
    camPos:  [0, 22, 90] as [number, number, number],
    target:  [0, 20,  0] as [number, number, number],
    build:   buildV2,
  },
] as const;

type WorldId = typeof WORLDS[number]["id"];

// ── Component ─────────────────────────────────────────────────────────────────

export function WorldLab() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<WorldId>("v1");

  // Three.js state persists in refs — never recreated on re-render
  const rendererRef  = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef     = useRef<THREE.Scene | null>(null);
  const cameraRef    = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef  = useRef<OrbitControls | null>(null);
  const bundleRef    = useRef<SceneBundle | null>(null);
  const rafRef       = useRef(0);
  const timerRef     = useRef(new THREE.Timer());

  // ── Init renderer (once) ───────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    // Force canvas to fill its container via CSS — without this, Three.js sets
    // only the HTML width/height attributes (2× on HiDPI), making the canvas
    // physically larger than the viewport and blocking pointer events on the UI.
    renderer.domElement.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 400);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping  = true;
    controls.dampingFactor  = 0.05;
    controls.minDistance    = 3;
    controls.maxDistance    = 300;
    controlsRef.current = controls;

    const syncSize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // Keep terrain uViewH in sync
      bundleRef.current?.timeMats.forEach(m => {
        if (m.uniforms.uViewH) m.uniforms.uViewH.value = h;
      });
    };
    syncSize();

    const animate = (ts: number) => {
      rafRef.current = requestAnimationFrame(animate);
      timerRef.current.update(ts);
      const t = timerRef.current.getElapsed();
      bundleRef.current?.timeMats.forEach(m => {
        if (m.uniforms.uTime) m.uniforms.uTime.value = t;
      });
      controls.update();
      renderer.render(scene, camera);
    };
    requestAnimationFrame(animate);

    const ro = new ResizeObserver(syncSize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      bundleRef.current?.dispose();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  // ── Swap world when tab changes ────────────────────────────────────────────
  useEffect(() => {
    const scene    = sceneRef.current;
    const camera   = cameraRef.current;
    const controls = controlsRef.current;
    if (!scene || !camera || !controls) return;

    bundleRef.current?.dispose();
    bundleRef.current = null;

    const def    = WORLDS.find(w => w.id === active)!;
    bundleRef.current = def.build(scene);

    camera.position.set(...def.camPos);
    controls.target.set(...def.target);
    controls.update();
  }, [active]);

  const activeWorld = WORLDS.find(w => w.id === active)!;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* Canvas — z-0 keeps it below the z-10 UI overlay */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-10 flex items-stretch border-b border-white/10 bg-black/60 backdrop-blur-sm">
        <span className="px-5 py-3 font-mono text-xs text-white/25 border-r border-white/10 flex items-center">
          3D LAB
        </span>
        {WORLDS.map(w => (
          <button
            key={w.id}
            onClick={() => setActive(w.id)}
            className={`px-6 py-3 font-mono text-sm border-r border-white/10 transition-colors ${
              active === w.id
                ? "text-white bg-white/8"
                : "text-white/35 hover:text-white/60"
            }`}
          >
            {w.label}
          </button>
        ))}
        <div className="ml-auto px-5 flex items-center font-mono text-xs text-white/20">
          drag · scroll · right-click
        </div>
      </div>

      {/* Active world info */}
      <div className="absolute bottom-6 left-6 z-10 font-mono text-xs text-white/30 space-y-1">
        <div className="text-white/50">{activeWorld.label}</div>
        <div>{activeWorld.desc}</div>
      </div>

      {/* Reset camera button */}
      <button
        onClick={() => {
          const camera   = cameraRef.current;
          const controls = controlsRef.current;
          if (!camera || !controls) return;
          const def = WORLDS.find(w => w.id === active)!;
          camera.position.set(...def.camPos);
          controls.target.set(...def.target);
          controls.update();
        }}
        className="absolute bottom-6 right-6 z-10 px-4 py-2 font-mono text-xs text-white/35 border border-white/15 hover:text-white/60 hover:border-white/30 transition-colors"
      >
        reset camera
      </button>
    </div>
  );
}
