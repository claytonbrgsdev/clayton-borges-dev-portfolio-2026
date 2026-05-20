/**
 * Convergence intro — trinity genesis (~3s, compressed from original 10s).
 *
 *  0.0 – 0.7   NODE_1    top glow point appears
 *  0.5 – 1.3   NODE_2    bottom-left
 *  1.0 – 1.8   NODE_3    bottom-right
 *  1.7 – 2.3   FILAMENT  triangle traces in
 *  1.7          onBuildMain fires
 *  2.3 – 3.0   OUTRO     intro elements dissolve
 *  3.0+         DONE
 */

import * as THREE from 'three';

// ── Utilities ─────────────────────────────────────────────────────────────────

function eio(t: number): number { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; }
function c01(t: number): number { return Math.max(0, Math.min(1, t)); }
function ramp(e: number, s: number, n: number): number { return eio(c01((e - s) / (n - s))); }

// ── Genesis glow shader ───────────────────────────────────────────────────────

const GLOW_VERT = /* glsl */`
  uniform float uSize;
  uniform float uBrightness;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * uBrightness;
    gl_Position  = projectionMatrix * mv;
  }
`;
const GLOW_FRAG = /* glsl */`
  uniform vec3  uColor;
  uniform float uBrightness;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float core = exp(-d * d * 26.0);
    float halo = exp(-d * d *  5.0) * 0.55;
    float a    = (core + halo) * uBrightness;
    if (a < 0.004) discard;
    vec3 col = mix(vec3(1.0, 0.97, 0.88), uColor, smoothstep(0.0, 0.28, d));
    gl_FragColor = vec4(col * (1.2 + core * 3.5), a);
  }
`;

// ── Founding triangle positions (radius 12, equilateral in XZ plane) ─────────
// These MUST match the genesis node positions in ConvergenceLab.tsx.
export const TRINITY_POS = [
  new THREE.Vector3(  0,    0,  12),   // top
  new THREE.Vector3(-10.4,  0,  -6),   // bottom-left
  new THREE.Vector3( 10.4,  0,  -6),   // bottom-right
] as const;

// ── Camera keyframes (compressed) ────────────────────────────────────────────

interface CamKF { t: number; pos: THREE.Vector3; tgt: THREE.Vector3 }

const KF: CamKF[] = [
  { t: 0.0, pos: new THREE.Vector3(0, 20,  35), tgt: new THREE.Vector3(0, 0, 0) },
  { t: 1.7, pos: new THREE.Vector3(0, 40,  55), tgt: new THREE.Vector3(0, 0, 0) },
  { t: 3.0, pos: new THREE.Vector3(0, 80,  80), tgt: new THREE.Vector3(0, 0, 0) },
];

// ── Exports ───────────────────────────────────────────────────────────────────

export interface IntroController {
  update(dt: number, camera: THREE.PerspectiveCamera): void;
  setViewH(h: number): void;
  readonly done: boolean;
  dispose(): void;
}

// ── Builder ───────────────────────────────────────────────────────────────────

export function buildIntroSequence(
  scene:       THREE.Scene,
  onBuildMain: () => void,
): IntroController {

  let elapsed   = 0;
  let isDone    = false;
  let mainFired = false;

  const allMats: THREE.Material[]       = [];
  const allGeos: THREE.BufferGeometry[] = [];
  const allObjs: THREE.Object3D[]       = [];

  function track(o: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material) {
    allObjs.push(o); allGeos.push(g); allMats.push(m); scene.add(o);
  }

  function makeGlow(pos: THREE.Vector3, color: THREE.Color) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',
      new THREE.BufferAttribute(new Float32Array([pos.x, pos.y, pos.z]), 3));
    const mat = new THREE.ShaderMaterial({
      vertexShader:   GLOW_VERT,
      fragmentShader: GLOW_FRAG,
      uniforms: {
        uSize:       { value: 68 },
        uBrightness: { value: 0  },
        uColor:      { value: color.clone() },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    track(pts, geo, mat);
    return mat;
  }

  const gold = new THREE.Color(0xd4a840);
  const gm1  = makeGlow(TRINITY_POS[0], gold);
  const gm2  = makeGlow(TRINITY_POS[1], gold);
  const gm3  = makeGlow(TRINITY_POS[2], gold);

  // Triangle filament
  const triPts = new Float32Array([
    ...TRINITY_POS[0].toArray(),
    ...TRINITY_POS[1].toArray(),
    ...TRINITY_POS[2].toArray(),
    ...TRINITY_POS[0].toArray(),
  ]);
  const triGeo = new THREE.BufferGeometry();
  triGeo.setAttribute('position', new THREE.BufferAttribute(triPts, 3));
  triGeo.setDrawRange(0, 1);
  const triMat = new THREE.LineBasicMaterial({
    color:       gold,
    opacity:     0,
    transparent: true,
    blending:    THREE.AdditiveBlending,
    depthWrite:  false,
  });
  const triLine = new THREE.Line(triGeo, triMat);
  triLine.frustumCulled = false;
  allMats.push(triMat); allGeos.push(triGeo); allObjs.push(triLine);
  scene.add(triLine);

  // Camera driver
  const _cp = new THREE.Vector3();
  const _ct = new THREE.Vector3();
  const _ts = new THREE.Vector3();
  let _tsInit = false;

  function driveCamera(dt: number, camera: THREE.PerspectiveCamera) {
    let ai = 0;
    for (let i = 0; i < KF.length - 1; i++) if (elapsed >= KF[i].t) ai = i;
    const a   = KF[ai];
    const b   = KF[Math.min(ai + 1, KF.length - 1)];
    const seg = b.t - a.t;
    const raw = seg > 0 ? (elapsed - a.t) / seg : 1;
    _cp.lerpVectors(a.pos, b.pos, eio(c01(raw)));
    _ct.lerpVectors(a.tgt, b.tgt, eio(c01(raw)));
    if (!_tsInit) { _ts.copy(_ct); _tsInit = true; }
    _ts.lerp(_ct, c01(dt * 2.0));
    camera.position.copy(_cp);
    camera.lookAt(_ts);
  }

  return {
    get done() { return isDone; },

    update(dt: number, camera: THREE.PerspectiveCamera) {
      if (isDone) return;
      elapsed += Math.min(dt, 0.05);
      const e = elapsed;

      driveCamera(dt, camera);

      const outroFade = 1 - ramp(e, 2.3, 3.0);

      const pulse = (b: number) => b > 0.9 ? b * (0.82 + 0.18 * Math.sin(e * 2.2)) : b;
      gm1.uniforms.uBrightness.value = pulse(ramp(e, 0.0, 0.7)) * outroFade;
      gm2.uniforms.uBrightness.value = pulse(ramp(e, 0.5, 1.3)) * outroFade;
      gm3.uniforms.uBrightness.value = pulse(ramp(e, 1.0, 1.8)) * outroFade;

      const triT = ramp(e, 1.7, 2.3);
      triGeo.setDrawRange(0, Math.floor(triT * 4));
      triMat.opacity = 0.10 * Math.min(triT > 0 ? 1 : 0, 1) * outroFade;

      if (!mainFired && e >= 1.7) { mainFired = true; onBuildMain(); }
      if (e >= 3.0) isDone = true;
    },

    setViewH(_h: number) { /* no view-height dependent uniforms */ },

    dispose() {
      allObjs.forEach(o => scene.remove(o));
      allGeos.forEach(g => g.dispose());
      allMats.forEach(m => m.dispose());
    },
  };
}
