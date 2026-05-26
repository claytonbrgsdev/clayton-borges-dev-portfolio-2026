"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader }   from "three/examples/jsm/loaders/GLTFLoader.js";
import { PLYLoader }    from "three/examples/jsm/loaders/PLYLoader.js";
import { buildWorld } from "@/lib/three/world-geometry";
import { buildClusters, buildOscilloscopeTraces } from "@/lib/three/energy-geometry";
import { buildV2World } from "@/lib/three/v2-world";
import { buildV3World } from "@/lib/three/v3-world";
import { buildV4World } from "@/lib/three/v4-world";
import { buildV5World, SERPENT_SCALE } from "@/lib/three/v5-world";
import { WorldSynth }                  from "@/lib/audio/world-synth";

// ── V1 shaders (verbatim from PointCloudWorld, uAppear fixed to 1.0) ─────────

const V1_TERRAIN_VERT = /* glsl */ `
  uniform float uSize;
  uniform float uViewH;
  uniform float uTime;
  uniform float uWaveAmp;
  varying float vDepth;
  varying float vHeight;
  void main() {
    float h = clamp(position.y / 25.0, 0.0, 1.0);
    float wave =
      sin(position.x * 0.08  + uTime * 0.25) * 0.18 +
      sin(position.z * 0.07  - uTime * 0.20) * 0.15 +
      sin((position.x + position.z * 0.6) * 0.11 + uTime * 0.33) * 0.10;
    wave *= uWaveAmp * (0.06 + h * 0.22);
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
  uniform float uSpeedMult;
  attribute float aSpeed;
  attribute float aPhase;
  varying  float  vBright;
  varying  float  vDepth;
  void main() {
    // flow=0 → top of slab (head), increases → moves down, wraps back to top
    float flow   = fract(aPhase - uTime * aSpeed * 0.11 * uSpeedMult);
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
  uniform float uSizeMult;
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
    gl_PointSize = clamp(uSizeMult * 1400.0 / vDepth, 1.0, 32.0);
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

// ── V3 shaders — Interference Field ──────────────────────────────────────────

// Ground grid — Y driven by 5-source circular wave interference each frame
const V3_GROUND_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uWaveAmp;
  uniform float uWaveSpeed;
  varying float vHeight;
  varying float vDepth;
  void main() {
    float px = position.x;
    float pz = position.z;
    float wt = uTime * uWaveSpeed;

    // 5 circular ripple sources — asymmetric placement creates rich moiré
    float wave =
      sin(length(vec2(px + 32.0, pz + 18.0)) * 0.18 - wt * 0.62) * 3.5 +
      sin(length(vec2(px - 28.0, pz - 22.0)) * 0.15 - wt * 0.48) * 3.2 +
      sin(length(vec2(px +  8.0, pz - 45.0)) * 0.12 - wt * 0.38) * 2.8 +
      sin(length(vec2(px - 48.0, pz + 10.0)) * 0.21 - wt * 0.70) * 2.4 +
      sin(length(vec2(px + 22.0, pz + 38.0)) * 0.10 - wt * 0.44) * 2.6 +
      // planar waves that cross the circular pattern
      sin(px * 0.09 + wt * 0.32) * 1.8 +
      sin(pz * 0.08 - wt * 0.28) * 1.6 +
      sin((px - pz) * 0.07 + wt * 0.22) * 1.4;

    float worldY = wave * 0.52 * uWaveAmp; // scale so max Y ≈ ±10 units
    vHeight = worldY;

    vec4 mv  = modelViewMatrix * vec4(px, worldY, pz, 1.0);
    vDepth   = -mv.z;

    // Points grow larger at crests — visual "pressure" between neighbours
    float crestT = clamp((worldY + 6.0) / 13.0, 0.0, 1.0);
    gl_PointSize = clamp((0.9 + crestT * 2.2) * 260.0 / vDepth, 0.3, 5.5);
    gl_Position  = projectionMatrix * mv;
  }
`;
const V3_GROUND_FRAG = /* glsl */ `
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vHeight;
  varying float vDepth;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float fog   = smoothstep(uFogNear, uFogFar, vDepth);
    float alpha = (1.0 - smoothstep(0.25, 0.5, d)) * (1.0 - fog);

    // Deep navy at troughs → steel blue at mid → near-white at crests
    float t    = clamp((vHeight + 7.0) / 14.0, 0.0, 1.0);
    vec3 colA  = vec3(0.03, 0.10, 0.28); // deep navy (trough)
    vec3 colB  = vec3(0.18, 0.52, 0.88); // steel blue (mid)
    vec3 colC  = vec3(0.82, 0.94, 1.00); // near white (crest)
    vec3 col   = t < 0.5
      ? mix(colA, colB, t * 2.0)
      : mix(colB, colC, (t - 0.5) * 2.0);

    alpha *= (0.25 + t * 0.75); // dim at troughs, bright at crests
    if (alpha < 0.007) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

// Atmospheric drift — correlated swirling; similar phases → apparent flocking
const V3_ATM_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aLayer;
  varying float vDepth;
  varying float vAlpha;
  varying vec3  vColor;
  void main() {
    float t  = uTime * aSpeed;
    // Two overlapping elliptical orbits per particle — creates density waves
    float dx = sin(t * 0.31 + aPhase)        * 5.0
             + sin(t * 0.19 + aPhase * 1.73) * 2.2;
    float dz = cos(t * 0.27 + aPhase * 0.79) * 5.0
             + cos(t * 0.16 + aPhase * 2.37) * 1.9;
    float dy = sin(t * 0.23 + aPhase * 1.31) * 2.0;

    vec4 mv  = modelViewMatrix * vec4(
      position.x + dx, position.y + dy, position.z + dz, 1.0);
    vDepth   = -mv.z;

    // Altitude drives colour: steel blue low → near-white high
    vColor = mix(
      vec3(0.12, 0.38, 0.72),
      vec3(0.80, 0.94, 1.00),
      aLayer
    );
    vAlpha = mix(0.35, 0.18, aLayer);

    gl_PointSize = clamp(140.0 / vDepth, 0.4, 2.4);
    gl_Position  = projectionMatrix * mv;
  }
`;
const V3_ATM_FRAG = /* glsl */ `
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vDepth;
  varying float vAlpha;
  varying vec3  vColor;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    if (length(uv) > 0.5) discard;
    float alpha = (1.0 - smoothstep(0.15, 0.5, length(uv))) * vAlpha;
    alpha *= (1.0 - smoothstep(uFogNear, uFogFar, vDepth));
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// Orbital coronas — rings rotating at different speeds; pulse-comet travels around
const V3_CORONA_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aId;
  attribute float aT;
  varying float vDepth;
  varying float vBright;
  varying vec3  vColor;
  void main() {
    float r         = length(position.xz);
    float baseAngle = atan(position.z, position.x);
    // Alternate CW/CCW: even rings go one way, odd the other
    float dir = mod(aId, 2.0) < 1.0 ? 1.0 : -1.0;
    float rot = uTime * (0.06 + aId * 0.018) * dir;
    float ang = baseAngle + rot;

    float wx = cos(ang) * r;
    float wz = sin(ang) * r;
    float wy = position.y + sin(uTime * 0.55 + aId * 1.38 + aT * 6.28318) * 1.8;

    // Pulse-comet: a bright spot races around each ring
    float pf    = fract(aT - uTime * (0.10 + aId * 0.03));
    float pulse = pow(max(0.0, 1.0 - pf * 7.0), 2.2)            // head
                + pow(max(0.0, 1.0 - (1.0 - pf) * 7.0), 2.2);   // pre-wrap glow
    vBright = 0.32 + pulse * 0.90;

    // Inner rings bluer, outer rings near-white
    vColor = mix(
      vec3(0.15, 0.52, 0.95),
      vec3(0.82, 0.95, 1.00),
      aId / 5.0
    );

    vec4 mv  = modelViewMatrix * vec4(wx, wy, wz, 1.0);
    vDepth   = -mv.z;
    gl_PointSize = clamp(300.0 / vDepth, 0.5, 4.5);
    gl_Position  = projectionMatrix * mv;
  }
`;
const V3_CORONA_FRAG = /* glsl */ `
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vDepth;
  varying float vBright;
  varying vec3  vColor;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float alpha = (1.0 - smoothstep(0.2, 0.5, d)) * vBright * 0.90;
    alpha *= (1.0 - smoothstep(uFogNear, uFogFar, vDepth));
    if (alpha < 0.006) discard;
    gl_FragColor = vec4(vColor * (1.0 + vBright * 0.5), alpha);
  }
`;

// Shared wave formula — inlined into rock and rift vertex shaders so boulders
// and cracks ride the same surface as the ground grid.
const WAVE_BODY = /* glsl */ `
  float _wave(float px, float pz) {
    float wt = uTime * uWaveSpeed;
    return
      sin(length(vec2(px + 32.0, pz + 18.0)) * 0.18 - wt * 0.62) * 3.5 +
      sin(length(vec2(px - 28.0, pz - 22.0)) * 0.15 - wt * 0.48) * 3.2 +
      sin(length(vec2(px +  8.0, pz - 45.0)) * 0.12 - wt * 0.38) * 2.8 +
      sin(length(vec2(px - 48.0, pz + 10.0)) * 0.21 - wt * 0.70) * 2.4 +
      sin(length(vec2(px + 22.0, pz + 38.0)) * 0.10 - wt * 0.44) * 2.6 +
      sin(px * 0.09 + wt * 0.32) * 1.8 +
      sin(pz * 0.08 - wt * 0.28) * 1.6 +
      sin((px - pz) * 0.07 + wt * 0.22) * 1.4;
  }
`;

// Dome boulders — ride the same wave as the ground
// position.y = height above ground base; worldY = wave + position.y
const V3_ROCK_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uWaveAmp;
  uniform float uWaveSpeed;
  ${WAVE_BODY}
  attribute float aBright;
  varying  float  vBright;
  varying  float  vDepth;
  void main() {
    float px     = position.x;
    float pz     = position.z;
    float groundY = _wave(px, pz) * 0.52 * uWaveAmp;
    float worldY  = groundY + position.y;
    vBright = aBright;
    vec4 mv = modelViewMatrix * vec4(px, worldY, pz, 1.0);
    vDepth  = -mv.z;
    gl_PointSize = clamp(190.0 / vDepth, 0.3, 3.8);
    gl_Position  = projectionMatrix * mv;
  }
`;
const V3_ROCK_FRAG = /* glsl */ `
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vBright;
  varying float vDepth;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float fog   = smoothstep(uFogNear, uFogFar, vDepth);
    float alpha = (1.0 - smoothstep(0.22, 0.5, d)) * vBright * (1.0 - fog);
    // Steel blue at base → near-white at apex (matches ground palette)
    vec3 col = mix(vec3(0.10, 0.30, 0.65), vec3(0.80, 0.93, 1.00), vBright);
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

// Rift/fissure lines — follow the wave but sit 0.8 u below the surface.
// The rift vertex shader is identical to the ground's except for the depth offset.
const V3_RIFT_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uWaveAmp;
  uniform float uWaveSpeed;
  ${WAVE_BODY}
  varying float vDepth;
  void main() {
    float px     = position.x;
    float pz     = position.z;
    float worldY = _wave(px, pz) * 0.52 * uWaveAmp - 0.8; // sink below wave surface
    vec4 mv = modelViewMatrix * vec4(px, worldY, pz, 1.0);
    vDepth  = -mv.z;
    gl_PointSize = clamp(190.0 / vDepth, 0.3, 3.2);
    gl_Position  = projectionMatrix * mv;
  }
`;
const V3_RIFT_FRAG = /* glsl */ `
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vDepth;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float fog   = smoothstep(uFogNear, uFogFar, vDepth);
    // Always bright electric cyan — glowing crack regardless of wave phase
    float alpha = pow(max(0.0, 1.0 - d * 1.9), 1.2) * 0.72 * (1.0 - fog);
    if (alpha < 0.006) discard;
    gl_FragColor = vec4(0.30, 0.72, 1.00, alpha);
  }
`;

// Strings — Lissajous oscilloscope traces (same technique as v1, mono blue palette)
const V3_STRING_VERT = /* glsl */ `
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
  varying float vBright;
  void main() {
    float turns = aHarmonic * 6.28318;
    float oscA  = sin(aFreqA * uTime + aPhaseA + aT * turns);
    float oscB  = cos(aFreqB * uTime + aPhaseB + aT * turns * 0.618);
    vec3 displaced = position + aAmp * (oscA * aNormal + oscB * aBinormal);
    vColor  = mix(aColorA, aColorB, aT);
    vBright = 0.45 + 0.55 * abs(sin(uTime * 1.6 + aPhaseA + aT * 3.14159));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;
const V3_STRING_FRAG = /* glsl */ `
  varying vec3  vColor;
  varying float vBright;
  void main() {
    float alpha = vBright * 0.78;
    if (alpha < 0.008) discard;
    gl_FragColor = vec4(vColor * (1.0 + vBright * 0.65), alpha);
  }
`;

// ── V4 shaders — Aurora Vortex ────────────────────────────────────────────────

// Ice ground plane — static dim points with aurora-reflection shimmer
const V4_ICE_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aBright;
  varying  float  vBright;
  varying  float  vDepth;
  void main() {
    vec4 mv      = modelViewMatrix * vec4(position, 1.0);
    vDepth       = -mv.z;
    // Slow shimmer: simulates reflected aurora rippling across the ice
    float shimmer = 0.70 + 0.30 * sin(uTime * 0.32 + position.x * 0.07 + position.z * 0.05);
    vBright      = aBright * shimmer;
    gl_PointSize = clamp(160.0 / vDepth, 0.3, 2.6);
    gl_Position  = projectionMatrix * mv;
  }
`;
const V4_ICE_FRAG = /* glsl */ `
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
    gl_FragColor = vec4(vec3(0.72, 0.88, 1.00) * vBright, alpha);
  }
`;

// Aurora curtains — the main visual element.
// Each curtain folds (fabric-wave radial displacement), shimmers (brightness
// wave running upward), lifts (slow Y oscillation), and drifts (vortex
// rotation around the world Y axis).
const V4_CURTAIN_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uFoldAmp;
  uniform float uDriftSpeed;
  uniform float uShimmerSpeed;
  attribute float aT;            // 0 = curtain bottom, 1 = top
  attribute float aS;            // 0 = left edge, 1 = right edge
  attribute float aPhase;        // per-curtain constant phase
  attribute float aCurtainAngle; // angle from +Z (radians) at rest

  varying float vT;
  varying float vBright;
  varying float vDepth;

  void main() {
    // ── Fabric fold (radial displacement) ───────────────────────────────────
    // Displaces the curtain surface in/out along its outward radial direction.
    // Amplitude is larger at the base, tapering toward the top.
    float foldWave = sin(aS * 3.14159 * 3.5 + uTime * 0.42 + aPhase)
                   * uFoldAmp * (1.0 - aT * 0.46);
    float rdx = sin(aCurtainAngle);
    float rdz = cos(aCurtainAngle);

    vec3 pos = position;
    pos.x += rdx * foldWave;
    pos.z += rdz * foldWave;

    // ── Gentle lift (whole curtain breathes vertically) ──────────────────────
    pos.y += sin(uTime * 0.17 + aPhase) * 2.6;

    // ── Vortex drift (curtain orbits slowly around world Y axis) ─────────────
    // All curtains rotate at the same base rate; the per-curtain phase offset
    // keeps them spread out rather than clumping at the same angle.
    float driftAngle = uTime * uDriftSpeed + aPhase * 0.12;
    float cosA = cos(driftAngle), sinA = sin(driftAngle);
    float nx = pos.x * cosA - pos.z * sinA;
    float nz = pos.x * sinA + pos.z * cosA;
    pos = vec3(nx, pos.y, nz);

    vec4 mv  = modelViewMatrix * vec4(pos, 1.0);
    vDepth   = -mv.z;
    vT       = aT;

    // ── Shimmer (brightness wave running upward along the curtain) ───────────
    float shimmer = 0.55 + 0.45 * sin(aT * 11.0 - uTime * uShimmerSpeed + aPhase * 1.6);
    float pulse   = 0.78 + 0.22 * sin(uTime * 0.85 + aPhase);
    vBright = shimmer * pulse;

    // Soft edge fade: sin(s·π) peaks at 1 in the middle, 0 at both edges
    float edge = sin(aS * 3.14159);
    gl_PointSize = clamp(vBright * edge * 740.0 / vDepth, 0.3, 8.5);
    gl_Position  = projectionMatrix * mv;
  }
`;
const V4_CURTAIN_FRAG = /* glsl */ `
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vT;
  varying float vBright;
  varying float vDepth;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float alpha = pow(max(0.0, 1.0 - d * 2.0), 1.2) * 0.70 * vBright;
    alpha *= (1.0 - smoothstep(uFogNear, uFogFar, vDepth));
    if (alpha < 0.004) discard;
    // Deep teal (base) → emerald green (mid) → icy white-blue (top)
    vec3 colA = vec3(0.00, 0.22, 0.40);
    vec3 colB = vec3(0.00, 0.88, 0.52);
    vec3 colC = vec3(0.60, 0.96, 1.00);
    vec3 col  = vT < 0.45
      ? mix(colA, colB,  vT / 0.45)
      : mix(colB, colC, (vT - 0.45) / 0.55);
    gl_FragColor = vec4(col * (0.85 + vBright * 1.15), alpha);
  }
`;

// Magnetic-field-line streams — helical charged-particle paths
const V4_STREAM_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aT;     // 0 = bottom, 1 = top of helix
  attribute float aPhase; // per-stream constant phase

  varying float vBright;
  varying float vDepth;

  void main() {
    // Whole-stream gentle sway (as if buffeted by the aurora wind)
    float sway   = sin(uTime * 0.10 + aPhase) * 1.6;
    vec3  pos    = position;
    pos.x += sway * cos(aPhase);
    pos.z += sway * sin(aPhase);

    vec4 mv  = modelViewMatrix * vec4(pos, 1.0);
    vDepth   = -mv.z;

    // Travelling brightness pulse ascending the helix
    float pulse  = sin(aT * 8.0 - uTime * 3.6 + aPhase * 2.1) * 0.5 + 0.5;
    vBright = 0.12 + pulse * 0.68;

    gl_PointSize = clamp(vBright * 420.0 / vDepth, 0.3, 4.5);
    gl_Position  = projectionMatrix * mv;
  }
`;
const V4_STREAM_FRAG = /* glsl */ `
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vBright;
  varying float vDepth;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float alpha = (1.0 - smoothstep(0.18, 0.5, d)) * vBright * 0.65;
    alpha *= (1.0 - smoothstep(uFogNear, uFogFar, vDepth));
    if (alpha < 0.003) discard;
    // Deep electric blue → near-white as pulse intensity rises
    vec3 col = mix(
      vec3(0.08, 0.35, 0.88),
      vec3(0.65, 0.95, 1.00),
      vBright
    );
    gl_FragColor = vec4(col, alpha);
  }
`;

// Background stars — static, very dim
const V4_STAR_VERT = /* glsl */ `
  varying float vDepth;
  void main() {
    vec4 mv  = modelViewMatrix * vec4(position, 1.0);
    vDepth   = -mv.z;
    gl_PointSize = clamp(100.0 / vDepth, 0.2, 1.4);
    gl_Position  = projectionMatrix * mv;
  }
`;
const V4_STAR_FRAG = /* glsl */ `
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    if (length(uv) > 0.5) discard;
    gl_FragColor = vec4(0.68, 0.80, 1.00, 0.38);
  }
`;

// ── V5 shaders — Serpent Infinity ────────────────────────────────────────────

// Helper embedded in serpent vert: lemniscate position and tangent.
// The ∞ is vertical: x=scale·0.5·sin(2t), y=scale·cos(t), z=scale·0.18·sin(t)·sin(2t)
const V5_LEM_BODY = /* glsl */ `
  vec3 lemPos(float t, float sc) {
    return vec3(
      sc * 0.5  * sin(2.0 * t),
      sc        * cos(t),
      sc * 0.18 * sin(t) * sin(2.0 * t)
    );
  }
  vec3 lemTan(float t, float sc) {
    float dx = sc        * cos(2.0 * t);
    float dy = -sc       * sin(t);
    float dz = sc * 0.18 * (cos(t) * sin(2.0 * t) + 2.0 * sin(t) * cos(2.0 * t));
    return normalize(vec3(dx, dy, dz));
  }
`;

// Serpent body — point-cloud tube whose position is fully computed in shader.
// aBodyT = 0 (head) → 1 (tail). Head is bright white-gold, tail is deep violet.
// uTimeOffset / uEchoAlpha: 0/1.0 for main body; 1.2/0.25 for ghost echo layer.
const V5_SERPENT_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uBodySpeed;   // path speed (rad / s)
  uniform float uBodyArc;     // body arc length (default ≈ 5.47 = 2π × 0.87)
  uniform float uScale;       // lemniscate scale
  uniform float uTubeRadius;  // tube cross-section radius
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uTimeOffset;  // 0 = main serpent, >0 = ghost echo
  uniform float uEchoAlpha;   // 1.0 = main, ~0.25 for ghost

  attribute float aBodyT;
  attribute float aRingAngle;
  attribute float aRingRadius;
  attribute float aRidgeFlag;  // 1.0 = dorsal ridge particle

  varying vec3  vColor;
  varying float vBright;
  varying float vDepth;
  varying float vAlphaMult;

  ${V5_LEM_BODY}

  void main() {
    float phase   = (uTime + uTimeOffset) * uBodySpeed - aBodyT * uBodyArc;
    vec3  pathPos = lemPos(phase, uScale);
    vec3  tangent = lemTan(phase, uScale);

    // Frenet frame — fall back to X axis when tangent ≈ world-up
    vec3 worldUp = vec3(0.0, 1.0, 0.0);
    vec3 ref     = abs(dot(tangent, worldUp)) > 0.90
                   ? vec3(1.0, 0.0, 0.0) : worldUp;
    vec3 normal  = normalize(cross(tangent, ref));
    vec3 binorm  = cross(tangent, normal);

    // Body taper: widest at 30 %, tapering toward head and tail
    float taper = 1.0 - pow(clamp(abs(aBodyT - 0.30) * 1.28, 0.0, 1.0), 1.9);
    taper = clamp(taper, 0.22, 1.0);
    // Head flare: the very tip fans out slightly
    float headFlare   = 1.0 + smoothstep(0.06, 0.0, aBodyT) * 0.80;
    float effectiveR  = uTubeRadius * taper * headFlare;

    // Organic undulation
    float undulate = sin(phase * 4.5 + uTime * 3.8) * effectiveR * 0.18;
    float rScale   = aRingRadius * effectiveR;
    vec3 ring      = normal * (cos(aRingAngle) * rScale + undulate)
                   + binorm *  sin(aRingAngle) * rScale;

    vec3 pos = pathPos + ring;

    // ── Scale diamond pattern ──────────────────────────────────────────────────
    // Interlocking diamond shapes across body length and circumference.
    float scaleRow   = aBodyT * 28.0;                      // 28 scale rows
    float scaleU     = fract(scaleRow) - 0.5;             // -0.5 → 0.5 along row
    float scaleV     = fract(aRingAngle / 6.28318 + floor(scaleRow) * 0.5) - 0.5;
    float diamond    = abs(scaleU) + abs(scaleV);          // L1 distance = diamond
    float scalePat   = 1.0 - smoothstep(0.20, 0.42, diamond); // bright inside scales
    // Apply only in the mid-body; fade near head and tail
    float scaleZone  = smoothstep(0.07, 0.22, aBodyT) * smoothstep(1.0, 0.78, aBodyT);
    float scaleBoost = mix(1.0, scalePat * 1.55 + 0.30, scaleZone);

    // ── Brightness layers ──────────────────────────────────────────────────────
    float headBright = pow(max(0.0, 1.0 - aBodyT), 0.48);
    float shimmer    = 0.60 + 0.40 * sin(phase * 6.0 + uTime * 11.0);
    float coreBright = 1.0 + (1.0 - aRingRadius) * 0.65; // inner pts glow more
    float ridgeBright= 1.0 + aRidgeFlag * 1.80;           // dorsal ridge boost
    // Head flame: very bright tight cluster at front
    float flame      = smoothstep(0.05, 0.0, aBodyT) * 3.20;

    vBright    = headBright * mix(1.0, shimmer, smoothstep(0.0, 0.35, aBodyT))
               * coreBright * ridgeBright * scaleBoost + flame;
    vAlphaMult = uEchoAlpha;

    // ── Color ──────────────────────────────────────────────────────────────────
    // Main body: warm gold → electric cyan → deep violet
    vec3 colHead = vec3(1.00, 0.90, 0.55);
    vec3 colMid  = vec3(0.00, 0.90, 1.00);
    vec3 colTail = vec3(0.38, 0.00, 0.82);
    vec3 bodyCol = aBodyT < 0.38
      ? mix(colHead, colMid,  aBodyT / 0.38)
      : mix(colMid,  colTail, (aBodyT - 0.38) / 0.62);
    // Ghost echo: shift hue toward deep violet-magenta
    float echoBlend = step(0.01, uTimeOffset);
    vec3 echoCol    = vec3(0.48, 0.05, 0.92);
    vColor = mix(bodyCol, echoCol, echoBlend * 0.75);

    // ── Point size ─────────────────────────────────────────────────────────────
    vec4 mv  = modelViewMatrix * vec4(pos, 1.0);
    vDepth   = -mv.z;
    float sz = taper * clamp(vBright * 0.45, 0.25, 1.6);
    sz *= 1.0 + aRidgeFlag * 0.75; // ridge particles are slightly larger
    gl_PointSize = clamp(sz * 1300.0 / vDepth, 0.3, 24.0);
    gl_Position  = projectionMatrix * mv;
  }
`;
const V5_SERPENT_FRAG = /* glsl */ `
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec3  vColor;
  varying float vBright;
  varying float vDepth;
  varying float vAlphaMult;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float alpha = pow(max(0.0, 1.0 - d * 2.0), 1.05) * 0.90 * vBright;
    alpha *= (1.0 - smoothstep(uFogNear, uFogFar, vDepth));
    alpha *= vAlphaMult;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(vColor * (0.85 + vBright * 1.15), alpha);
  }
`;

// Cage ∞ loops — large lemniscate wireframes, dim electric blue, slow breathing
const V5_CAGE_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aT;
  varying float vBright;
  varying float vDepth;
  void main() {
    // Gentle radial breathing: push/pull each point along its XZ direction
    float r = length(position.xz);
    float breathe = sin(aT * 8.0 + uTime * 0.55) * 0.9;
    vec3 pos = position;
    if (r > 0.01) {
      pos.x += (pos.x / r) * breathe;
      pos.z += (pos.z / r) * breathe;
    }
    vec4 mv  = modelViewMatrix * vec4(pos, 1.0);
    vDepth   = -mv.z;
    // Travelling brightness pulse along the loop
    float pulse = 0.30 + 0.28 * sin(aT * 6.28318 * 3.0 - uTime * 0.80);
    vBright = pulse;
    gl_Position = projectionMatrix * mv;
  }
`;
const V5_CAGE_FRAG = /* glsl */ `
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vBright;
  varying float vDepth;
  void main() {
    float fog   = smoothstep(uFogNear, uFogFar, vDepth);
    float alpha = vBright * (1.0 - fog);
    if (alpha < 0.008) discard;
    gl_FragColor = vec4(0.18, 0.48, 0.92, alpha * 0.52);
  }
`;

// Tendrils — long helical lines with a travelling pulse from center to tip
const V5_TENDRIL_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aT;     // 0 = center, 1 = tip
  attribute float aPhase; // per-tendril constant phase
  varying float vBright;
  varying float vDepth;
  void main() {
    // Travelling pulse: bright band sweeps from center toward tip
    float pulse    = sin(aT * 10.0 - uTime * 2.2 + aPhase) * 0.5 + 0.5;
    float tipFade  = 1.0 - aT * aT;           // fades toward tip
    float centFade = smoothstep(0.0, 0.12, aT); // fades near center
    vBright = pulse * tipFade * centFade * 0.82;

    // Slight sway of the whole tendril
    vec3 pos = position;
    float sway = sin(uTime * 0.18 + aPhase) * aT * 1.4;
    pos.y += sway;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vDepth  = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const V5_TENDRIL_FRAG = /* glsl */ `
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vBright;
  varying float vDepth;
  void main() {
    float fog   = smoothstep(uFogNear, uFogFar, vDepth);
    float alpha = vBright * (1.0 - fog);
    if (alpha < 0.006) discard;
    gl_FragColor = vec4(0.55, 0.78, 1.00, alpha * 0.58);
  }
`;

// Energy orbs — dense pulsing clusters at key inflection points of the ∞
const V5_ORB_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uFogNear;
  uniform float uFogFar;
  attribute float aPhase;
  attribute float aOrbId;
  varying vec3  vColor;
  varying float vBright;
  varying float vDepth;
  void main() {
    // Orb-wide synchronised pulse + per-point shimmer
    float orbPulse = sin(uTime * 2.2 + aOrbId * 2.094) * 0.5 + 0.5; // 120° apart
    float shimmer  = 0.55 + 0.45 * sin(uTime * 5.5 + aPhase);
    vBright = (0.50 + orbPulse * 0.50) * shimmer;

    // Orb colours: center = white-cyan, top = warm gold, bottom = violet
    vec3 colCenter = vec3(0.70, 1.00, 1.00);
    vec3 colTop    = vec3(1.00, 0.88, 0.40);
    vec3 colBottom = vec3(0.60, 0.15, 1.00);
    vColor = aOrbId < 0.5 ? colCenter
           : aOrbId < 1.5 ? colTop
           :                colBottom;

    vec4 mv  = modelViewMatrix * vec4(position, 1.0);
    vDepth   = -mv.z;
    gl_PointSize = clamp(vBright * 1000.0 / vDepth, 0.5, 12.0);
    gl_Position  = projectionMatrix * mv;
  }
`;
const V5_ORB_FRAG = /* glsl */ `
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec3  vColor;
  varying float vBright;
  varying float vDepth;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float alpha = pow(max(0.0, 1.0 - d * 1.8), 1.2) * 0.95 * vBright;
    alpha *= (1.0 - smoothstep(uFogNear, uFogFar, vDepth));
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(vColor * (1.2 + vBright * 0.8), alpha);
  }
`;

// Nebula — slow atmospheric drift, very dim blue-purple
const V5_NEBULA_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aBright;
  attribute float aPhase;
  varying float vBright;
  varying float vDepth;
  void main() {
    // Very slow drift in a tight radius around rest position
    vec3 pos = position;
    pos.x += sin(uTime * 0.12 + aPhase)        * 2.2;
    pos.y += sin(uTime * 0.09 + aPhase * 1.37) * 1.6;
    pos.z += cos(uTime * 0.11 + aPhase * 0.83) * 2.0;
    float flicker = 0.70 + 0.30 * sin(uTime * 0.6 + aPhase * 2.1);
    vBright = aBright * flicker;
    vec4 mv  = modelViewMatrix * vec4(pos, 1.0);
    vDepth   = -mv.z;
    gl_PointSize = clamp(80.0 / vDepth, 0.2, 1.8);
    gl_Position  = projectionMatrix * mv;
  }
`;
const V5_NEBULA_FRAG = /* glsl */ `
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vBright;
  varying float vDepth;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    if (length(uv) > 0.5) discard;
    float fog   = smoothstep(uFogNear, uFogFar, vDepth);
    float alpha = (1.0 - smoothstep(0.15, 0.5, length(uv))) * vBright * (1.0 - fog);
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(0.35, 0.20, 0.70, alpha);
  }
`;

// ── Scene bundle type ─────────────────────────────────────────────────────────

interface SceneBundle {
  timeMats:   THREE.ShaderMaterial[]; // materials that need uTime updates
  setParam:   (key: string, val: number) => void;
  swapModel?: (filename: string) => void; // v6 only
  update?:    (dt: number, camera: THREE.PerspectiveCamera, controls: OrbitControls) => void;
  dispose:    () => void;
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
      uColor:    { value: new THREE.Color(0x00bbdd) },
      uFogNear:  { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      uSize:     { value: 1.2 }, uViewH: { value: 800 },
      uTime:     { value: 0 },
      uWaveAmp:  { value: 1.0 },
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

  const v1FogMats = [terrainMat, clusterMat, traceMat];
  return {
    timeMats: mats,
    setParam: (key, val) => {
      if (key === 'fogNear')      v1FogMats.forEach(m => { if (m.uniforms.uFogNear) m.uniforms.uFogNear.value = val; });
      if (key === 'fogFar')       v1FogMats.forEach(m => { if (m.uniforms.uFogFar)  m.uniforms.uFogFar.value  = val; });
      if (key === 'v1.pointSize') terrainMat.uniforms.uSize.value     = val;
      if (key === 'v1.waveAmp')   terrainMat.uniforms.uWaveAmp.value  = val;
    },
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
  const cascadeMats: THREE.ShaderMaterial[] = [];
  for (const cascade of world.cascades) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: V2_CASCADE_VERT, fragmentShader: V2_CASCADE_FRAG,
      uniforms: {
        uColor:      { value: new THREE.Color(0x55eeff) },
        uFogNear:    { value: FOG_NEAR }, uFogFar:  { value: FOG_FAR },
        uTime:       { value: 0 },
        uSlabBottom: { value: cascade.slabBottom },
        uSlabH:      { value: cascade.slabH },
        uSpeedMult:  { value: 1.0 },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    cascadeMats.push(mat);
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
      uFogNear:  { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      uTime:     { value: 0 },
      uSizeMult: { value: 1.0 },
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

  const v2AllMats = [slabMat, ...cascadeMats, plasmaMat, hazeMat];
  return {
    timeMats: mats,
    setParam: (key, val) => {
      if (key === 'fogNear')         v2AllMats.forEach(m => { if (m.uniforms.uFogNear) m.uniforms.uFogNear.value = val; });
      if (key === 'fogFar')          v2AllMats.forEach(m => { if (m.uniforms.uFogFar)  m.uniforms.uFogFar.value  = val; });
      if (key === 'v2.cascadeSpeed') cascadeMats.forEach(m => m.uniforms.uSpeedMult.value = val);
      if (key === 'v2.plasmaSize')   plasmaMat.uniforms.uSizeMult.value = val;
    },
    dispose: () => { objs.forEach(o => scene.remove(o)); geos.forEach(g => g.dispose()); mats.forEach(m => m.dispose()); },
  };
}

// ── V3 scene builder — Interference Field ────────────────────────────────────

function buildV3(scene: THREE.Scene): SceneBundle {
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.ShaderMaterial[] = [];
  const objs: THREE.Object3D[] = [];

  const add = (obj: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.ShaderMaterial) => {
    geos.push(geo); mats.push(mat); objs.push(obj); scene.add(obj);
  };

  const FOG_NEAR = 55, FOG_FAR = 270;
  const world = buildV3World(42);

  // ── Ground field ───────────────────────────────────────────────────────────
  const groundMat = new THREE.ShaderMaterial({
    vertexShader: V3_GROUND_VERT, fragmentShader: V3_GROUND_FRAG,
    uniforms: {
      uFogNear:   { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      uTime:      { value: 0 },
      uWaveAmp:   { value: 1.0 },
      uWaveSpeed: { value: 1.0 },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const groundGeo = new THREE.BufferGeometry();
  groundGeo.setAttribute("position", new THREE.BufferAttribute(world.ground.positions, 3));
  add(new THREE.Points(groundGeo, groundMat), groundGeo, groundMat);

  // ── Dome boulders — ride the wave surface ──────────────────────────────────
  const rockMat = new THREE.ShaderMaterial({
    vertexShader: V3_ROCK_VERT, fragmentShader: V3_ROCK_FRAG,
    uniforms: {
      uFogNear:   { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      uTime:      { value: 0 },
      uWaveAmp:   { value: 1.0 },
      uWaveSpeed: { value: 1.0 },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const rockGeo = new THREE.BufferGeometry();
  rockGeo.setAttribute("position", new THREE.BufferAttribute(world.rocks.positions,  3));
  rockGeo.setAttribute("aBright",  new THREE.BufferAttribute(world.rocks.brightness, 1));
  add(new THREE.Points(rockGeo, rockMat), rockGeo, rockMat);

  // ── Rift / fissure lines — glow just below wave surface ───────────────────
  const riftMat = new THREE.ShaderMaterial({
    vertexShader: V3_RIFT_VERT, fragmentShader: V3_RIFT_FRAG,
    uniforms: {
      uFogNear:   { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      uTime:      { value: 0 },
      uWaveAmp:   { value: 1.0 },
      uWaveSpeed: { value: 1.0 },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const riftGeo = new THREE.BufferGeometry();
  riftGeo.setAttribute("position", new THREE.BufferAttribute(world.rifts.positions, 3));
  add(new THREE.Points(riftGeo, riftMat), riftGeo, riftMat);

  // ── Atmospheric drift layers ───────────────────────────────────────────────
  const atmMat = new THREE.ShaderMaterial({
    vertexShader: V3_ATM_VERT, fragmentShader: V3_ATM_FRAG,
    uniforms: {
      uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      uTime:    { value: 0 },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const atmGeo = new THREE.BufferGeometry();
  const atm = world.atmosphere;
  atmGeo.setAttribute("position", new THREE.BufferAttribute(atm.positions, 3));
  atmGeo.setAttribute("aPhase",   new THREE.BufferAttribute(atm.phases,    1));
  atmGeo.setAttribute("aSpeed",   new THREE.BufferAttribute(atm.speeds,    1));
  atmGeo.setAttribute("aLayer",   new THREE.BufferAttribute(atm.layers,    1));
  add(new THREE.Points(atmGeo, atmMat), atmGeo, atmMat);

  // ── Orbital coronas ────────────────────────────────────────────────────────
  const corMat = new THREE.ShaderMaterial({
    vertexShader: V3_CORONA_VERT, fragmentShader: V3_CORONA_FRAG,
    uniforms: {
      uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      uTime:    { value: 0 },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const corGeo = new THREE.BufferGeometry();
  const cor = world.coronas;
  corGeo.setAttribute("position", new THREE.BufferAttribute(cor.positions, 3));
  corGeo.setAttribute("aId",      new THREE.BufferAttribute(cor.ids,       1));
  corGeo.setAttribute("aT",       new THREE.BufferAttribute(cor.ts,        1));
  add(new THREE.Points(corGeo, corMat), corGeo, corMat);

  // ── Oscilloscope strings — Lissajous lines between attractor nodes ─────────
  const stringMat = new THREE.ShaderMaterial({
    vertexShader: V3_STRING_VERT, fragmentShader: V3_STRING_FRAG,
    uniforms: { uTime: { value: 0 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  for (const ed of world.strings) {
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
    objs.push(new THREE.Line(g, stringMat));
    scene.add(objs[objs.length - 1]);
  }
  mats.push(stringMat);

  const v3AllMats = [groundMat, rockMat, riftMat, atmMat, corMat, stringMat];
  const v3WaveMats = [groundMat, rockMat, riftMat];
  return {
    timeMats: mats,
    setParam: (key, val) => {
      if (key === 'fogNear')      v3AllMats.forEach(m => { if (m.uniforms.uFogNear) m.uniforms.uFogNear.value = val; });
      if (key === 'fogFar')       v3AllMats.forEach(m => { if (m.uniforms.uFogFar)  m.uniforms.uFogFar.value  = val; });
      if (key === 'v3.waveAmp')   v3WaveMats.forEach(m => m.uniforms.uWaveAmp.value   = val);
      if (key === 'v3.waveSpeed') v3WaveMats.forEach(m => m.uniforms.uWaveSpeed.value = val);
    },
    dispose: () => {
      objs.forEach(o => scene.remove(o));
      geos.forEach(g => g.dispose());
      mats.forEach(m => m.dispose());
    },
  };
}

// ── V4 scene builder — Aurora Vortex ─────────────────────────────────────────

function buildV4(scene: THREE.Scene): SceneBundle {
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.ShaderMaterial[] = [];
  const objs: THREE.Object3D[] = [];

  const add = (obj: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.ShaderMaterial) => {
    geos.push(geo); mats.push(mat); objs.push(obj); scene.add(obj);
  };

  const FOG_NEAR = 80, FOG_FAR = 360;
  const world = buildV4World(42);

  // ── Ice ground plane ───────────────────────────────────────────────────────
  const iceMat = new THREE.ShaderMaterial({
    vertexShader: V4_ICE_VERT, fragmentShader: V4_ICE_FRAG,
    uniforms: {
      uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      uTime:    { value: 0 },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const iceGeo = new THREE.BufferGeometry();
  iceGeo.setAttribute("position", new THREE.BufferAttribute(world.ice.positions,  3));
  iceGeo.setAttribute("aBright",  new THREE.BufferAttribute(world.ice.brightness, 1));
  add(new THREE.Points(iceGeo, iceMat), iceGeo, iceMat);

  // ── Aurora curtains ────────────────────────────────────────────────────────
  const curtainMat = new THREE.ShaderMaterial({
    vertexShader: V4_CURTAIN_VERT, fragmentShader: V4_CURTAIN_FRAG,
    uniforms: {
      uFogNear:      { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      uTime:         { value: 0 },
      uFoldAmp:      { value: 5.0   },
      uDriftSpeed:   { value: 0.055 },
      uShimmerSpeed: { value: 2.9   },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const curtainGeo = new THREE.BufferGeometry();
  const c = world.curtains;
  curtainGeo.setAttribute("position",      new THREE.BufferAttribute(c.positions,     3));
  curtainGeo.setAttribute("aT",            new THREE.BufferAttribute(c.ts,            1));
  curtainGeo.setAttribute("aS",            new THREE.BufferAttribute(c.ss,            1));
  curtainGeo.setAttribute("aPhase",        new THREE.BufferAttribute(c.phases,        1));
  curtainGeo.setAttribute("aCurtainAngle", new THREE.BufferAttribute(c.curtainAngles, 1));
  add(new THREE.Points(curtainGeo, curtainMat), curtainGeo, curtainMat);

  // ── Helical streams ────────────────────────────────────────────────────────
  const streamMat = new THREE.ShaderMaterial({
    vertexShader: V4_STREAM_VERT, fragmentShader: V4_STREAM_FRAG,
    uniforms: {
      uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      uTime:    { value: 0 },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const streamGeo = new THREE.BufferGeometry();
  const s = world.streams;
  streamGeo.setAttribute("position", new THREE.BufferAttribute(s.positions, 3));
  streamGeo.setAttribute("aT",       new THREE.BufferAttribute(s.ts,        1));
  streamGeo.setAttribute("aPhase",   new THREE.BufferAttribute(s.phases,    1));
  add(new THREE.Points(streamGeo, streamMat), streamGeo, streamMat);

  // ── Background stars ───────────────────────────────────────────────────────
  // Stars have no uTime — static material, not in timeMats.
  const starMat = new THREE.ShaderMaterial({
    vertexShader: V4_STAR_VERT, fragmentShader: V4_STAR_FRAG,
    uniforms: {},
    transparent: true, depthWrite: false,
  });
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(world.stars.positions, 3));
  // Push manually — stars don't need time updates
  geos.push(starGeo); objs.push(new THREE.Points(starGeo, starMat));
  mats.push(starMat);
  scene.add(objs[objs.length - 1]);

  const v4AllMats = [iceMat, curtainMat, streamMat, starMat];
  return {
    timeMats: [iceMat, curtainMat, streamMat],
    setParam: (key, val) => {
      if (key === 'fogNear')          v4AllMats.forEach(m => { if (m.uniforms.uFogNear) m.uniforms.uFogNear.value = val; });
      if (key === 'fogFar')           v4AllMats.forEach(m => { if (m.uniforms.uFogFar)  m.uniforms.uFogFar.value  = val; });
      if (key === 'v4.foldAmp')       curtainMat.uniforms.uFoldAmp.value      = val;
      if (key === 'v4.driftSpeed')    curtainMat.uniforms.uDriftSpeed.value   = val;
      if (key === 'v4.shimmerSpeed')  curtainMat.uniforms.uShimmerSpeed.value = val;
    },
    dispose: () => {
      objs.forEach(o => scene.remove(o));
      geos.forEach(g => g.dispose());
      mats.forEach(m => m.dispose());
    },
  };
}

// ── V5 scene builder — Serpent Infinity ──────────────────────────────────────

function buildV5(scene: THREE.Scene): SceneBundle {
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.ShaderMaterial[] = [];
  const objs: THREE.Object3D[] = [];

  const reg = (obj: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.ShaderMaterial) => {
    geos.push(geo); mats.push(mat); objs.push(obj); scene.add(obj);
  };

  const FOG_NEAR = 60, FOG_FAR = 320;
  const BODY_ARC  = Math.PI * 2 * 0.87; // 87 % of full loop
  const world = buildV5World(42);

  // ── Serpent body ───────────────────────────────────────────────────────────
  const makeSerp = (timeOffset: number, echoAlpha: number) =>
    new THREE.ShaderMaterial({
      vertexShader:   V5_SERPENT_VERT,
      fragmentShader: V5_SERPENT_FRAG,
      uniforms: {
        uTime:       { value: 0 },
        uBodySpeed:  { value: 0.70 },
        uBodyArc:    { value: BODY_ARC },
        uScale:      { value: SERPENT_SCALE },
        uTubeRadius: { value: 2.4 },
        uFogNear:    { value: FOG_NEAR },
        uFogFar:     { value: FOG_FAR },
        uTimeOffset: { value: timeOffset },
        uEchoAlpha:  { value: echoAlpha },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });

  const serpentMat = makeSerp(0.0, 1.0);
  const echoMat    = makeSerp(1.2, 0.25);

  const serpGeo = new THREE.BufferGeometry();
  const sp = world.serpent;
  serpGeo.setAttribute("position",    new THREE.BufferAttribute(sp.positions,   3));
  serpGeo.setAttribute("aBodyT",      new THREE.BufferAttribute(sp.bodyTs,      1));
  serpGeo.setAttribute("aRingAngle",  new THREE.BufferAttribute(sp.ringAngles,  1));
  serpGeo.setAttribute("aRingRadius", new THREE.BufferAttribute(sp.ringRadii,   1));
  serpGeo.setAttribute("aRidgeFlag",  new THREE.BufferAttribute(sp.ridgeFlags,  1));

  // Main serpent — frustum culling disabled (shader-computed positions)
  const serpPts = new THREE.Points(serpGeo, serpentMat);
  serpPts.frustumCulled = false;
  reg(serpPts, serpGeo, serpentMat);

  // Ghost echo — same geometry, shifted time, violet hue, 25 % alpha
  const echoPts = new THREE.Points(serpGeo, echoMat);
  echoPts.frustumCulled = false;
  mats.push(echoMat);
  objs.push(echoPts);
  scene.add(echoPts);

  // ── Cage ∞ loops ───────────────────────────────────────────────────────────
  const cageMat = new THREE.ShaderMaterial({
    vertexShader:   V5_CAGE_VERT,
    fragmentShader: V5_CAGE_FRAG,
    uniforms: {
      uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      uTime:    { value: 0 },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  for (const cage of world.cageLines) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(cage.positions, 3));
    g.setAttribute("aT",       new THREE.BufferAttribute(cage.ts,        1));
    geos.push(g);
    const line = new THREE.Line(g, cageMat);
    objs.push(line);
    scene.add(line);
  }
  mats.push(cageMat);

  // ── Tendrils ───────────────────────────────────────────────────────────────
  // One shared material; per-tendril phase baked into aPhase vertex attribute
  const tendrilMat = new THREE.ShaderMaterial({
    vertexShader:   V5_TENDRIL_VERT,
    fragmentShader: V5_TENDRIL_FRAG,
    uniforms: {
      uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      uTime:    { value: 0 },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  for (const td of world.tendrils) {
    // Fill aPhase attribute with constant (td.phase) for all vertices
    const phaseArr = new Float32Array(td.count).fill(td.phase);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(td.positions, 3));
    g.setAttribute("aT",       new THREE.BufferAttribute(td.ts,        1));
    g.setAttribute("aPhase",   new THREE.BufferAttribute(phaseArr,     1));
    geos.push(g);
    const line = new THREE.Line(g, tendrilMat);
    objs.push(line);
    scene.add(line);
  }
  mats.push(tendrilMat);

  // ── Energy orbs ────────────────────────────────────────────────────────────
  const orbMat = new THREE.ShaderMaterial({
    vertexShader:   V5_ORB_VERT,
    fragmentShader: V5_ORB_FRAG,
    uniforms: {
      uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      uTime:    { value: 0 },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const orbGeo = new THREE.BufferGeometry();
  const o = world.orbs;
  orbGeo.setAttribute("position", new THREE.BufferAttribute(o.positions, 3));
  orbGeo.setAttribute("aPhase",   new THREE.BufferAttribute(o.phases,    1));
  orbGeo.setAttribute("aOrbId",   new THREE.BufferAttribute(o.orbIds,    1));
  reg(new THREE.Points(orbGeo, orbMat), orbGeo, orbMat);

  // ── Nebula ─────────────────────────────────────────────────────────────────
  const nebulaMat = new THREE.ShaderMaterial({
    vertexShader:   V5_NEBULA_VERT,
    fragmentShader: V5_NEBULA_FRAG,
    uniforms: {
      uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR },
      uTime:    { value: 0 },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const nebGeo = new THREE.BufferGeometry();
  const nb = world.nebula;
  nebGeo.setAttribute("position", new THREE.BufferAttribute(nb.positions,  3));
  nebGeo.setAttribute("aBright",  new THREE.BufferAttribute(nb.brightness, 1));
  nebGeo.setAttribute("aPhase",   new THREE.BufferAttribute(nb.phases,     1));
  reg(new THREE.Points(nebGeo, nebulaMat), nebGeo, nebulaMat);

  const v5AllFogMats = [serpentMat, echoMat, cageMat, tendrilMat, orbMat, nebulaMat];
  const v5SerpMats  = [serpentMat, echoMat];
  return {
    timeMats: [serpentMat, echoMat, cageMat, tendrilMat, orbMat, nebulaMat],
    setParam: (key, val) => {
      if (key === "fogNear")       v5AllFogMats.forEach(m => { if (m.uniforms.uFogNear) m.uniforms.uFogNear.value = val; });
      if (key === "fogFar")        v5AllFogMats.forEach(m => { if (m.uniforms.uFogFar)  m.uniforms.uFogFar.value  = val; });
      if (key === "v5.bodySpeed")  v5SerpMats.forEach(m => { m.uniforms.uBodySpeed.value  = val; });
      if (key === "v5.tubeRadius") v5SerpMats.forEach(m => { m.uniforms.uTubeRadius.value = val; });
      if (key === "v5.bodyArc") {
        const arc = Math.PI * 2 * val;
        v5SerpMats.forEach(m => { m.uniforms.uBodyArc.value = arc; });
      }
      if (key === "v5.echoAlpha")  echoMat.uniforms.uEchoAlpha.value = val;
    },
    dispose: () => {
      objs.forEach(o => scene.remove(o));
      geos.forEach(g => g.dispose());
      mats.forEach(m => m.dispose());
    },
  };
}

// ── v6 Model Viewer ───────────────────────────────────────────────────────────

// Model catalog — empty, models removed.
export const MODEL_CATALOG: ReadonlyArray<{ filename: string; label: string }> = [];

type ModelFilename = string;

function buildV6(scene: THREE.Scene): SceneBundle {
  let currentModel: THREE.Object3D | null = null;
  let mixer: THREE.AnimationMixer | null  = null;
  let loadGen = 0; // bumped on each swap to cancel in-flight loads

  // Standard lights — GLB materials need them (custom shader worlds don't)
  const ambient  = new THREE.AmbientLight(0xffffff, 0.75);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
  dirLight.position.set(15, 30, 20);
  const fillLight = new THREE.DirectionalLight(0x8899ff, 0.4);
  fillLight.position.set(-20, -10, -15);
  scene.add(ambient, dirLight, fillLight);

  const clearCurrent = () => {
    if (currentModel) {
      scene.remove(currentModel);
      currentModel.traverse(child => {
        if (
          child instanceof THREE.Mesh ||
          child instanceof THREE.Points ||
          child instanceof THREE.Line
        ) {
          child.geometry?.dispose();
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m: THREE.Material | null) => m?.dispose());
        }
      });
      currentModel = null;
    }
    mixer?.stopAllAction();
    mixer = null;
  };

  // Normalize model to ~50 world-unit max extent, centered at origin
  const fitToScene = (obj: THREE.Object3D) => {
    const box = new THREE.Box3().setFromObject(obj);
    const size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      obj.scale.setScalar(50 / maxDim);
      box.setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      obj.position.sub(center);
    }
  };

  const swapModel = (filename: string) => {
    const gen = ++loadGen;
    clearCurrent();

    const url = `/models/${encodeURIComponent(filename)}`;

    if (filename.toLowerCase().endsWith(".ply")) {
      new PLYLoader().load(url, (geo) => {
        if (gen !== loadGen) { geo.dispose(); return; }
        geo.computeVertexNormals();
        const hasColor = geo.hasAttribute("color");
        const mat = new THREE.PointsMaterial({
          size: 0.15,
          vertexColors: hasColor,
          color: hasColor ? undefined : new THREE.Color(0x88ccff),
        });
        const pts = new THREE.Points(geo, mat);
        fitToScene(pts);
        scene.add(pts);
        currentModel = pts;
      });
    } else {
      new GLTFLoader().load(url, (gltf) => {
        if (gen !== loadGen) return;
        const obj = gltf.scene;
        fitToScene(obj);
        scene.add(obj);
        currentModel = obj;
        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(obj);
          gltf.animations.forEach(clip => mixer!.clipAction(clip).play());
        }
      });
    }
  };

  return {
    timeMats:  [],
    setParam:  () => {},
    swapModel,
    update:    (dt) => { mixer?.update(dt); },
    dispose:   () => {
      loadGen++; // cancel any in-flight load
      clearCurrent();
      scene.remove(ambient, dirLight, fillLight);
    },
  };
}

// ── Monochromatic point-cloud shader — v7 Convergence ────────────────────────
//
// ANIM_MODE define (0–7) bakes a zone-specific animation into each material at
// compile time — no runtime branching cost.
//
//   0 = static / base terrain
//   1 = geology ripple   (heightmap, boyd)
//   2 = cloud drift      (abstract cloud)
//   3 = life breathe     (park)
//   4 = deep swirl       (crystal coves)
//   5 = fire ember       (volcano, lava)
//   6 = ice crystal      (siple coast)
//   7 = scanline sweep   (TLS scan)
//
// uZoneWeight (0–1): set per-frame from camera proximity.
//   Controls animation intensity AND model visibility — models fade in as the
//   camera enters their zone and fade out when it leaves.

const MONO_VERT = /* glsl */ `
  #ifdef USE_VERTEX_COLOR
  attribute vec3 color;
  #endif
  uniform float uTime;
  uniform float uPointSize;
  uniform float uZoneWeight; // 0–1 proximity weight
  uniform vec3  uCentroid;   // model AABB centre for swirl/scatter

  varying float vDepth;
  varying float vLuma;
  varying float vIntensity;  // per-point brightness multiplier
  varying float vWorldY;     // world-space Y for scanline

  float hash3(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }

  void main() {
    vec3  pos = position;
    float ph  = hash3(pos) * 6.28318; // per-point random phase
    float w   = uZoneWeight;
    vIntensity = 1.0;

    // ── Zone animation ───────────────────────────────────────────────────────
    #if ANIM_MODE == 1
      // Geology ripple — sin-wave Y displacement driven by XZ
      float rip = sin(pos.x * 0.07 + pos.z * 0.05 + uTime * 0.35 + ph * 0.4) * 2.0
                + sin(pos.x * 0.04 - pos.z * 0.09 + uTime * 0.22            ) * 1.0;
      pos.y += rip * w;

    #elif ANIM_MODE == 2
      // Cloud drift — slow volumetric wander in all axes
      pos.x += sin(uTime * 0.14 + ph       ) * 4.5 * w;
      pos.y += sin(uTime * 0.11 + ph * 1.4 ) * 2.5 * w;
      pos.z += cos(uTime * 0.12 + ph * 0.9 ) * 4.5 * w;

    #elif ANIM_MODE == 3
      // Life breathe — points grow from base + gentle lateral sway
      float fromBase = (pos.y - uCentroid.y + 20.0) * 0.05;
      pos.y += fromBase * sin(uTime * 0.45 + ph * 0.5) * 0.14 * w;
      pos.x += sin(uTime * 0.28 + ph       ) * 0.7 * w;
      pos.z += cos(uTime * 0.31 + ph * 1.2 ) * 0.7 * w;

    #elif ANIM_MODE == 4
      // Deep swirl — XZ rotation around centroid at height-dependent rate
      float dx = pos.x - uCentroid.x;
      float dz = pos.z - uCentroid.z;
      float r  = sqrt(dx * dx + dz * dz) + 0.001;
      float baseAng = atan(dz, dx);
      float swirl   = uTime * 0.07 * w * (1.0 + 0.4 * sin(pos.y * 0.08));
      pos.x = uCentroid.x + cos(baseAng + swirl) * r;
      pos.z = uCentroid.z + sin(baseAng + swirl) * r;
      pos.y += sin(uTime * 0.18 + ph) * 1.5 * w;
      vIntensity = 0.55 + 0.45 * sin(uTime * 0.55 + ph);

    #elif ANIM_MODE == 5
      // Fire ember — cyclic Y rise with horizontal sway; bright at birth
      float t = fract(uTime * 0.10 + ph);
      pos.y += t * 14.0 * w;
      pos.x += sin(uTime * 1.3 + ph * 3.1) * t * 2.5 * w;
      pos.z += cos(uTime * 1.1 + ph * 2.7) * t * 2.5 * w;
      vIntensity = max(0.1, 1.0 - t * 1.2);

    #elif ANIM_MODE == 6
      // Ice crystal — very slow drift + rare sharp glint
      pos.x += sin(uTime * 0.045 + ph       ) * 2.2 * w;
      pos.z += cos(uTime * 0.038 + ph * 1.3 ) * 2.2 * w;
      pos.y += sin(uTime * 0.055 + ph * 0.8 ) * 1.0 * w;
      float glint = step(0.985, fract(sin(uTime * 2.0 + ph * 7.0) * 43.7));
      vIntensity = 1.0 + glint * 4.0;

    #elif ANIM_MODE == 7
      // Scan drift — subtle motion; scanline highlight applied in frag
      pos.x += sin(uTime * 0.06 + ph       ) * 1.0 * w;
      pos.z += cos(uTime * 0.05 + ph * 1.1 ) * 1.0 * w;

    #endif
    // ANIM_MODE == 0: no animation

    vec4 mv    = modelViewMatrix * vec4(pos, 1.0);
    vDepth     = -mv.z;
    vWorldY    = pos.y;

    #ifdef USE_VERTEX_COLOR
    vLuma = dot(color, vec3(0.299, 0.587, 0.114));
    #else
    vLuma = 0.65;
    #endif

    float pulse  = 1.0 + 0.04 * sin(uTime * 0.4 + ph);
    gl_PointSize = clamp(uPointSize * 400.0 / vDepth * pulse, 0.3, 5.0);
    gl_Position  = projectionMatrix * mv;
  }
`;

const MONO_FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uTime;
  uniform float uZoneWeight;

  varying float vDepth;
  varying float vLuma;
  varying float vIntensity;
  varying float vWorldY;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;

    float alpha = 1.0 - smoothstep(0.25, 0.5, d);
    alpha *= (1.0 - smoothstep(uFogNear, uFogFar, vDepth));

    // Fade in/out with zone weight — models appear only when camera is near
    alpha *= smoothstep(0.0, 0.3, uZoneWeight);
    if (alpha < 0.004) discard;

    float luma = vLuma * vIntensity;
    vec3  col  = uColor * (0.3 + luma * 1.1);

    // Scanline highlight: bright band sweeps upward through the model
    #if ANIM_MODE == 7
    float band = fract(uTime * 0.11) * 55.0;
    col *= 1.0 + 3.0 * smoothstep(2.5, 0.0, abs(vWorldY - band)) * uZoneWeight;
    #endif

    gl_FragColor = vec4(col, alpha * (0.5 + luma * 0.5));
  }
`;

// ── Region / audio-zone map ───────────────────────────────────────────────────
//
// pos[1] = floor Y: bottom of the normalised model snaps to this height.
//   0   = rests on terrain surface
//  >0   = floats above terrain
//  <0   = partially submerged
//
// animMode → see ANIM_MODE defines in MONO_VERT above.

interface RegionDef {
  id:         string;
  zoneId:     string;
  filename:   string | null;
  pos:        [number, number, number];
  targetSize: number;
  zoneRadius: number;
  animMode:   number; // 0–7
}

const REGION_DEFS: RegionDef[] = [
  { id: 'origin', zoneId: 'origin', filename: null,
    pos: [0, 0, 0], targetSize: 80, zoneRadius: 110, animMode: 0 },
];

// ── Mono material factory ─────────────────────────────────────────────────────

function makeMono(
  hasColor: boolean,
  animMode: number,
  fogNear:  number,
  fogFar:   number,
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader:   MONO_VERT,
    fragmentShader: MONO_FRAG,
    defines: {
      ...(hasColor ? { USE_VERTEX_COLOR: '' } : {}),
      ANIM_MODE: animMode.toFixed(0),
    },
    uniforms: {
      uTime:       { value: 0 },
      uPointSize:  { value: 1.0 },
      uZoneWeight: { value: 0.0 }, // start invisible; set each frame
      uCentroid:   { value: new THREE.Vector3() },
      uColor:      { value: new THREE.Color(0x22d3ee) },
      uFogNear:    { value: fogNear },
      uFogFar:     { value: fogFar },
    },
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  });
}

// ── Point-cloud extractor ─────────────────────────────────────────────────────
// Returns the materials created (for per-region zone-weight tracking).

function extractPointClouds(
  root:     THREE.Object3D,
  animMode: number,
  centroid: THREE.Vector3,
  fogNear:  number,
  fogFar:   number,
  allMats:  THREE.ShaderMaterial[],
  geos:     THREE.BufferGeometry[],
  objs:     THREE.Object3D[],
  scene:    THREE.Scene,
): THREE.ShaderMaterial[] {
  const created: THREE.ShaderMaterial[] = [];
  root.updateWorldMatrix(true, true);
  root.traverse(child => {
    if (!(child instanceof THREE.Mesh) && !(child instanceof THREE.Points)) return;
    const geo = child.geometry.clone();
    child.updateWorldMatrix(true, false);
    geo.applyMatrix4(child.matrixWorld);
    const m = makeMono(geo.hasAttribute('color'), animMode, fogNear, fogFar);
    m.uniforms.uCentroid.value.copy(centroid);
    const pts = new THREE.Points(geo, m);
    pts.frustumCulled = false;
    created.push(m);
    allMats.push(m);
    geos.push(geo);
    objs.push(pts);
    scene.add(pts);
  });
  return created;
}

// ── v7 camera path ────────────────────────────────────────────────────────────
// CatmullRom splines through each zone; ~120 s full loop.
// Position curve visits every model cluster; target curve looks ahead / at POI.

const V7_CAM_POS = new THREE.CatmullRomCurve3([
  new THREE.Vector3(  0,  50, 140),  //  0 high overview
  new THREE.Vector3(  0,  12,  60),  //  1 descend to terrain
  new THREE.Vector3( 10,  20,   5),  //  2 skim terrain surface
  new THREE.Vector3( 10,  40, -40),  //  3 rise toward cloud
  new THREE.Vector3(  5,  44, -72),  //  4 inside cloud
  new THREE.Vector3(-15,  38, -50),  //  5 exit cloud westward
  new THREE.Vector3( 70,  10, -10),  //  6 bank east to heightmap
  new THREE.Vector3( 75,   4, -42),  //  7 low over heightmap
  new THREE.Vector3( 40,   8, -10),  //  8 pull back west
  new THREE.Vector3(-60,   8,  50),  //  9 Boyd1
  new THREE.Vector3(-95,   6,  90),  // 10 Boyd2
  new THREE.Vector3(-50,   8,  82),  // 11 Boyd3
  new THREE.Vector3(-30,  12,  30),  // 12 exit Boyd
  new THREE.Vector3(-80,   0, -40),  // 13 descend toward crystal coves
  new THREE.Vector3(-70,  -8, -62),  // 14 underwater crystal coves
  new THREE.Vector3(-20,   5,  10),  // 15 surface, turn east
  new THREE.Vector3( 55,  18,  25),  // 16 approach volcano
  new THREE.Vector3( 75,   6,  45),  // 17 volcano close
  new THREE.Vector3(100,   8,  82),  // 18 lava flow
  new THREE.Vector3(-60,   8, -15),  // 19 sweep to TLS scan
  new THREE.Vector3(-90,   6, -25),  // 20 TLS scan
  new THREE.Vector3(  0,  80,  60),  // 21 high arc
], true /* closed */);

const V7_CAM_TGT = new THREE.CatmullRomCurve3([
  new THREE.Vector3(  0,   5,   0),  //  0
  new THREE.Vector3(  0,   8,   0),  //  1
  new THREE.Vector3(  0,  15, -30),  //  2
  new THREE.Vector3(  0,  38, -55),  //  3 cloud
  new THREE.Vector3(  0,  35,-100),  //  4
  new THREE.Vector3( 70,   5, -15),  //  5
  new THREE.Vector3( 85,   3, -35),  //  6 heightmap
  new THREE.Vector3( 85,   0, -35),  //  7
  new THREE.Vector3(-80,   4,  45),  //  8
  new THREE.Vector3(-80,   2,  45),  //  9 Boyd1
  new THREE.Vector3(-100,  0,  90),  // 10 Boyd2
  new THREE.Vector3( -50,  0,  85),  // 11 Boyd3
  new THREE.Vector3( -95, -4, -60),  // 12
  new THREE.Vector3( -95, -8, -65),  // 13 crystal coves
  new THREE.Vector3( -95,-12, -65),  // 14
  new THREE.Vector3(  90,  5,  55),  // 15
  new THREE.Vector3(  90,  3,  55),  // 16 volcano
  new THREE.Vector3(  90,  0,  55),  // 17
  new THREE.Vector3( 110,  0,  90),  // 18 lava
  new THREE.Vector3( -90,  3, -20),  // 19
  new THREE.Vector3( -90,  0, -20),  // 20 TLS scan
  new THREE.Vector3(   0,  0,   0),  // 21 overview
], true /* closed */);

const V7_TOUR_DURATION = 120; // seconds per full loop

// ── v7 builder — Esoteric Convergence ────────────────────────────────────────

function buildV7(scene: THREE.Scene): SceneBundle {
  const timeMats: THREE.ShaderMaterial[] = [];
  const geos:     THREE.BufferGeometry[] = [];
  const objs:     THREE.Object3D[]       = [];
  let   disposed = false;

  // Per-region material registry (for zone-weight updates)
  const regionMats = new Map<string, THREE.ShaderMaterial[]>();
  REGION_DEFS.forEach(r => regionMats.set(r.id, []));

  const FOG_NEAR = 80, FOG_FAR = 600;

  // ── V1 procedural terrain at origin ──────────────────────────────────────
  const { positions: tp } = buildWorld(42);
  const terrainMat = new THREE.ShaderMaterial({
    vertexShader:   V1_TERRAIN_VERT,
    fragmentShader: V1_TERRAIN_FRAG,
    uniforms: {
      uSize:    { value: 1.2 },
      uViewH:   { value: 600 },
      uTime:    { value: 0 },
      uWaveAmp: { value: 0.8 },
      uColor:   { value: new THREE.Color(0x22d3ee) },
      uFogNear: { value: FOG_NEAR },
      uFogFar:  { value: FOG_FAR },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const terrainGeo = new THREE.BufferGeometry();
  terrainGeo.setAttribute("position", new THREE.BufferAttribute(tp, 3));
  const terrainPts = new THREE.Points(terrainGeo, terrainMat);
  terrainPts.frustumCulled = false;
  timeMats.push(terrainMat);
  geos.push(terrainGeo);
  objs.push(terrainPts);
  scene.add(terrainPts);

  // ── Async GLB model loads ─────────────────────────────────────────────────
  const loader = new GLTFLoader();

  for (const region of REGION_DEFS) {
    if (!region.filename) continue;
    const [px, py, pz] = region.pos;
    const rid = region.id;

    loader.load(`/models/${encodeURIComponent(region.filename)}`, (gltf) => {
      if (disposed) return;

      const obj    = gltf.scene;
      const box    = new THREE.Box3().setFromObject(obj);
      const size   = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) obj.scale.setScalar(region.targetSize / maxDim);

      // Floor-snap: XZ centred, Y bottom at py
      box.setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      obj.position.set(px - center.x, py - box.min.y, pz - center.z);
      obj.updateWorldMatrix(true, true);

      // Final centroid for swirl/breathe animations (world space after placement)
      box.setFromObject(obj);
      const worldCentroid = box.getCenter(new THREE.Vector3());

      const created = extractPointClouds(
        obj, region.animMode, worldCentroid,
        FOG_NEAR, FOG_FAR, timeMats, geos, objs, scene,
      );
      // Register for per-frame zone-weight updates
      const list = regionMats.get(rid) ?? [];
      created.forEach(m => list.push(m));
      regionMats.set(rid, list);
    });
  }

  // ── Camera sequencer state ────────────────────────────────────────────────
  let pathT       = 0;
  const lerpedTgt = new THREE.Vector3(0, 5, 0);

  return {
    timeMats,
    setParam: (key, val) => {
      if (key === "fogNear")      timeMats.forEach(m => { if (m.uniforms.uFogNear)   m.uniforms.uFogNear.value   = val; });
      if (key === "fogFar")       timeMats.forEach(m => { if (m.uniforms.uFogFar)    m.uniforms.uFogFar.value    = val; });
      if (key === "v7.pointSize") timeMats.forEach(m => { if (m.uniforms.uPointSize) m.uniforms.uPointSize.value = val; });
    },
    update: (dt, camera, controls) => {
      // Lock out orbit controls — camera is choreographed
      controls.enabled = false;

      // Advance path (clamped dt prevents jumps after tab-switch)
      pathT += Math.min(dt, 0.05) / V7_TOUR_DURATION;
      if (pathT >= 1.0) pathT -= 1.0;

      // Drive camera position directly on the curve
      camera.position.copy(V7_CAM_POS.getPointAt(pathT));

      // Smooth look-at target with cinematic lag
      const nextTgt = V7_CAM_TGT.getPointAt(pathT);
      lerpedTgt.lerp(nextTgt, Math.min(1, dt * 1.8));
      camera.lookAt(lerpedTgt);
      controls.target.copy(lerpedTgt);

      // Per-region zone weights → uZoneWeight on each region's materials
      const cam = camera.position;
      for (const region of REGION_DEFS) {
        const [rx, ry, rz] = region.pos;
        const dist = Math.sqrt((cam.x - rx) ** 2 + (cam.y - ry) ** 2 + (cam.z - rz) ** 2);
        const w    = Math.max(0, 1 - dist / region.zoneRadius);
        const mats = regionMats.get(region.id);
        if (mats) mats.forEach(m => { m.uniforms.uZoneWeight.value = w; });
      }
    },
    dispose: () => {
      disposed = true;
      objs.forEach(o => scene.remove(o));
      geos.forEach(g => g.dispose());
      timeMats.forEach(m => m.dispose());
    },
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
  {
    id:      "v3",
    label:   "v3 — Interference Field",
    desc:    "Wave interference ground · correlated drift layers · orbital particle rings",
    camPos:  [0, 30, 82] as [number, number, number],
    target:  [0,  8,  0] as [number, number, number],
    build:   buildV3,
  },
  {
    id:      "v4",
    label:   "v4 — Aurora Vortex",
    desc:    "Aurora curtains orbiting a zenith vortex · magnetic field streams · arctic ice",
    camPos:  [0, 22, 88] as [number, number, number],
    target:  [0, 36,  0] as [number, number, number],
    build:   buildV4,
  },
  {
    id:      "v5",
    label:   "v5 — Serpent ∞",
    desc:    "Point-cloud serpent chasing its tail · cage wireframes · helical tendrils · energy orbs",
    camPos:  [0, 0, 72] as [number, number, number],
    target:  [0, 0,  0] as [number, number, number],
    build:   buildV5,
  },
  {
    id:      "v6",
    label:   "v6 — Model Viewer",
    desc:    "Hot-swap 3D model viewer — GLB + PLY · animated models · auto-fit · orbit camera",
    camPos:  [0, 15, 80] as [number, number, number],
    target:  [0,  0,  0] as [number, number, number],
    build:   buildV6,
  },
  {
    id:      "v7",
    label:   "v7 — Convergence",
    desc:    "13 LiDAR / point-cloud models · V1 terrain · zone-reactive ambient synthesis",
    camPos:  [0, 30, 90] as [number, number, number],
    target:  [0, 5,   0] as [number, number, number],
    build:   buildV7,
  },
] as const;

type WorldId = typeof WORLDS[number]["id"];

// ── Param panel definitions ───────────────────────────────────────────────────

interface ParamDef {
  key:     string;
  label:   string;
  group:   "light" | "particles";
  min:     number;
  max:     number;
  step:    number;
  default: number;
}

const PARAM_DEFS: Record<WorldId, ParamDef[]> = {
  v1: [
    { key: "fogNear",      label: "Fog Start",   group: "light",     min: 0,   max: 200,  step: 5,     default: 60   },
    { key: "fogFar",       label: "Fog Distance", group: "light",     min: 80,  max: 600,  step: 10,    default: 280  },
    { key: "v1.pointSize", label: "Point Size",   group: "particles", min: 0.2, max: 3.5,  step: 0.05,  default: 1.2  },
    { key: "v1.waveAmp",   label: "Wave Height",  group: "particles", min: 0,   max: 3,    step: 0.05,  default: 1.0  },
  ],
  v2: [
    { key: "fogNear",         label: "Fog Start",      group: "light",     min: 0,   max: 200,  step: 5,    default: 55  },
    { key: "fogFar",          label: "Fog Distance",   group: "light",     min: 80,  max: 600,  step: 10,   default: 260 },
    { key: "v2.cascadeSpeed", label: "Cascade Speed",  group: "particles", min: 0,   max: 4,    step: 0.05, default: 1.0 },
    { key: "v2.plasmaSize",   label: "Plasma Size",    group: "particles", min: 0.2, max: 3,    step: 0.05, default: 1.0 },
  ],
  v3: [
    { key: "fogNear",      label: "Fog Start",    group: "light",     min: 0,  max: 200,  step: 5,    default: 55  },
    { key: "fogFar",       label: "Fog Distance", group: "light",     min: 80, max: 600,  step: 10,   default: 270 },
    { key: "v3.waveAmp",   label: "Wave Height",  group: "particles", min: 0,  max: 3,    step: 0.05, default: 1.0 },
    { key: "v3.waveSpeed", label: "Wave Speed",   group: "particles", min: 0,  max: 4,    step: 0.05, default: 1.0 },
  ],
  v4: [
    { key: "fogNear",         label: "Fog Start",     group: "light",     min: 0,   max: 200,  step: 5,     default: 80    },
    { key: "fogFar",          label: "Fog Distance",  group: "light",     min: 100, max: 700,  step: 10,    default: 360   },
    { key: "v4.foldAmp",      label: "Curtain Fold",  group: "particles", min: 0,   max: 14,   step: 0.2,   default: 5.0   },
    { key: "v4.driftSpeed",   label: "Vortex Speed",  group: "particles", min: 0,   max: 0.25, step: 0.005, default: 0.055 },
    { key: "v4.shimmerSpeed", label: "Shimmer Speed", group: "particles", min: 0,   max: 8,    step: 0.1,   default: 2.9   },
  ],
  v5: [
    { key: "fogNear",        label: "Fog Start",     group: "light",     min: 0,    max: 150,  step: 5,    default: 60   },
    { key: "fogFar",         label: "Fog Distance",  group: "light",     min: 80,   max: 600,  step: 10,   default: 320  },
    { key: "v5.bodySpeed",   label: "Serpent Speed", group: "particles", min: 0,    max: 3,    step: 0.05, default: 0.70 },
    { key: "v5.tubeRadius",  label: "Body Thickness",group: "particles", min: 0.5,  max: 6,    step: 0.1,  default: 2.4  },
    { key: "v5.bodyArc",     label: "Body Length",   group: "particles", min: 0.50, max: 0.99, step: 0.01, default: 0.87 },
    { key: "v5.echoAlpha",   label: "Ghost Echo",    group: "particles", min: 0,    max: 1,    step: 0.01, default: 0.25 },
  ],
  v6: [], // model viewer — no numeric params; model select is handled separately
  v7: [
    { key: "fogNear",      label: "Fog Start",    group: "light",     min: 0,   max: 400,  step: 10,   default: 80  },
    { key: "fogFar",       label: "Fog Distance", group: "light",     min: 100, max: 1200, step: 20,   default: 700 },
    { key: "v7.pointSize", label: "Point Size",   group: "particles", min: 0.2, max: 4,    step: 0.05, default: 1.0 },
  ],
};

function ParamSlider({
  def, value, onChange,
}: {
  def: ParamDef;
  value: number;
  onChange: (v: number) => void;
}) {
  const decimals = def.step < 0.01 ? 3 : def.step < 0.1 ? 2 : def.step < 1 ? 1 : 0;
  return (
    <div className="px-4 py-2.5">
      <div className="flex justify-between font-mono text-[11px] mb-1.5">
        <span className="text-white/45">{def.label}</span>
        <span className="text-white/65">{value.toFixed(decimals)}</span>
      </div>
      <input
        type="range"
        min={def.min} max={def.max} step={def.step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full cursor-pointer"
        style={{ accentColor: "#22d3ee", height: "2px" }}
      />
    </div>
  );
}

// ── Scene-wide presets ────────────────────────────────────────────────────────

const BG_PRESETS = [
  { label: "Void",  hex: "#000000" },
  { label: "Abyss", hex: "#010812" },
  { label: "Dusk",  hex: "#08010f" },
  { label: "Ember", hex: "#0a0401" },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export function WorldLab() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<WorldId>("v1");
  const [panelOpen, setPanelOpen] = useState(false);
  const [params, setParams] = useState<Record<string, number>>(
    () => Object.fromEntries(PARAM_DEFS["v1"].map(d => [d.key, d.default]))
  );
  const [brightness,     setBrightness]     = useState(1.0);
  const [bgColor,        setBgColor]        = useState<string>(BG_PRESETS[0].hex);
  const [selectedModel,  setSelectedModel]  = useState<ModelFilename>("");
  const [audioOn,        setAudioOn]        = useState(false);

  // Three.js state persists in refs — never recreated on re-render
  const rendererRef     = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef        = useRef<THREE.Scene | null>(null);
  const cameraRef       = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef     = useRef<OrbitControls | null>(null);
  const bundleRef       = useRef<SceneBundle | null>(null);
  const rafRef          = useRef(0);
  const timerRef        = useRef(new THREE.Timer());
  const synthRef        = useRef<WorldSynth | null>(null);
  const dominantZoneRef = useRef<HTMLSpanElement | null>(null);

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

    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 600);
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

    let prevT = 0;
    const animate = (ts: number) => {
      rafRef.current = requestAnimationFrame(animate);
      timerRef.current.update(ts);
      const t  = timerRef.current.getElapsed();
      const dt = t - prevT;
      prevT = t;
      bundleRef.current?.timeMats.forEach(m => {
        if (m.uniforms.uTime) m.uniforms.uTime.value = t;
      });
      bundleRef.current?.update?.(dt, camera, controls);

      // Zone-reactive audio — read camera pos (already moved by bundle.update)
      // and feed zone weights to the synth engine.
      const synth = synthRef.current;
      if (synth?.ready) {
        const cam = camera.position;
        let maxW = 0, domId = '';
        for (const region of REGION_DEFS) {
          const [rx, ry, rz] = region.pos;
          const dist = Math.sqrt((cam.x - rx) ** 2 + (cam.y - ry) ** 2 + (cam.z - rz) ** 2);
          const w    = Math.max(0, 1 - dist / region.zoneRadius);
          synth.setZoneWeight(region.zoneId, w);
          if (w > maxW) { maxW = w; domId = region.zoneId; }
        }
        if (dominantZoneRef.current) {
          dominantZoneRef.current.textContent = domId ? `♪ ${domId}` : '';
        }
      }

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

    // v7 locks controls for cinematic tour; restore for all other worlds
    controls.enabled = active !== "v7";

    const def    = WORLDS.find(w => w.id === active)!;
    bundleRef.current = def.build(scene);

    // v6: trigger the initial/current model load after bundle is ready
    if (active === "v6") {
      bundleRef.current.swapModel?.(selectedModel);
    }

    camera.position.set(...def.camPos);
    controls.target.set(...def.target);
    controls.minDistance = 3;
    controls.maxDistance = active === "v7" ? 600 : 300;
    controls.update();

    // Reset params to this world's defaults
    setParams(Object.fromEntries(PARAM_DEFS[active].map(d => [d.key, d.default])));
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Brightness → CSS filter on renderer canvas ─────────────────────────────
  useEffect(() => {
    const el = rendererRef.current?.domElement;
    if (!el) return;
    el.style.filter = brightness === 1.0 ? "" : `brightness(${brightness})`;
  }, [brightness]);

  // ── Background color → renderer clear color ────────────────────────────────
  useEffect(() => {
    rendererRef.current?.setClearColor(new THREE.Color(bgColor));
  }, [bgColor]);

  const handleParam = (key: string, val: number) => {
    setParams(prev => ({ ...prev, [key]: val }));
    bundleRef.current?.setParam(key, val);
  };

  const handleAudioToggle = () => {
    if (!audioOn) {
      if (!synthRef.current) synthRef.current = new WorldSynth();
      synthRef.current.init();
      setAudioOn(true);
    } else {
      synthRef.current?.dispose();
      synthRef.current = null;
      setAudioOn(false);
      if (dominantZoneRef.current) dominantZoneRef.current.textContent = '';
    }
  };

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
        <div className="ml-auto flex items-stretch">
          <span className="px-5 flex items-center font-mono text-xs text-white/20 border-r border-white/10">
            drag · scroll · right-click
          </span>
          <button
            onClick={() => setPanelOpen(o => !o)}
            className={`px-4 font-mono text-xs border-r border-white/10 transition-colors ${
              panelOpen
                ? "text-white/70 bg-white/8"
                : "text-white/30 hover:text-white/55"
            }`}
          >
            {panelOpen ? "✕ params" : "⊞ params"}
          </button>
          <button
            onClick={handleAudioToggle}
            title={audioOn ? "Stop audio synthesis" : "Start zone audio synthesis"}
            className={`px-4 font-mono text-xs transition-colors ${
              audioOn
                ? "text-cyan-400/80 bg-cyan-400/8"
                : "text-white/30 hover:text-white/55"
            }`}
          >
            {audioOn ? "♪ on" : "♪ off"}
          </button>
        </div>
      </div>

      {/* Floating params panel */}
      {panelOpen && (
        <div className="absolute top-[41px] right-0 bottom-0 z-20 w-56 bg-black/80 backdrop-blur-sm border-l border-white/10 overflow-y-auto">

          {/* Scene section */}
          <div className="pt-3">
            <div className="px-4 pb-1.5 font-mono text-[9px] tracking-widest text-white/25">
              SCENE
            </div>
            <div className="mx-4 border-t border-white/8 mb-1" />
            {/* Brightness slider */}
            <div className="px-4 py-2.5">
              <div className="flex justify-between font-mono text-[11px] mb-1.5">
                <span className="text-white/45">Brightness</span>
                <span className="text-white/65">{brightness.toFixed(2)}</span>
              </div>
              <input
                type="range" min={0.2} max={2.5} step={0.05}
                value={brightness}
                onChange={e => setBrightness(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: "#22d3ee", height: "2px" }}
              />
            </div>
            {/* Background color presets */}
            <div className="px-4 pb-3">
              <div className="font-mono text-[11px] text-white/45 mb-2">Background</div>
              <div className="grid grid-cols-4 gap-1">
                {BG_PRESETS.map(p => (
                  <button
                    key={p.hex}
                    onClick={() => setBgColor(p.hex)}
                    title={p.label}
                    className={`py-1.5 font-mono text-[9px] border transition-colors ${
                      bgColor === p.hex
                        ? "border-white/40 text-white/70"
                        : "border-white/12 text-white/30 hover:border-white/25 hover:text-white/50"
                    }`}
                    style={{ backgroundColor: p.hex === "#000000" ? "transparent" : p.hex + "80" }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Light section */}
          <div className="mt-2">
            <div className="px-4 pb-1.5 font-mono text-[9px] tracking-widest text-white/25">
              LIGHT
            </div>
            <div className="mx-4 border-t border-white/8 mb-1" />
            {PARAM_DEFS[active]
              .filter(d => d.group === "light")
              .map(d => (
                <ParamSlider
                  key={d.key}
                  def={d}
                  value={params[d.key] ?? d.default}
                  onChange={val => handleParam(d.key, val)}
                />
              ))}
          </div>

          {/* Particles section */}
          <div className="mt-4">
            <div className="px-4 pb-1.5 font-mono text-[9px] tracking-widest text-white/25">
              PARTICLES — {active.toUpperCase()}
            </div>
            <div className="mx-4 border-t border-white/8 mb-1" />
            {PARAM_DEFS[active]
              .filter(d => d.group === "particles")
              .map(d => (
                <ParamSlider
                  key={d.key}
                  def={d}
                  value={params[d.key] ?? d.default}
                  onChange={val => handleParam(d.key, val)}
                />
              ))}
          </div>

          {/* Model selector — v6 only */}
          {active === "v6" && (
            <div className="mt-2">
              <div className="px-4 pb-1.5 font-mono text-[9px] tracking-widest text-white/25">
                MODEL
              </div>
              <div className="mx-4 border-t border-white/8 mb-2" />
              <div className="px-4 pb-3">
                <select
                  value={selectedModel}
                  onChange={e => {
                    const f = e.target.value as ModelFilename;
                    setSelectedModel(f);
                    bundleRef.current?.swapModel?.(f);
                  }}
                  className="w-full bg-black border border-white/15 text-white/65 font-mono text-[10px] px-2 py-2 rounded-none outline-none cursor-pointer"
                  style={{ accentColor: "#22d3ee" }}
                >
                  {MODEL_CATALOG.map(m => (
                    <option key={m.filename} value={m.filename}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 font-mono text-[9px] text-white/20 leading-relaxed">
                  GLB + PLY supported.{" "}
                  Models marked ⚠ are large and may take a moment to load.
                </p>
              </div>
            </div>
          )}

          {/* Reset button — hidden for v6 (nothing to reset) */}
          {active !== "v6" && (
          <div className="px-4 pt-5 pb-4">
            <button
              onClick={() => {
                const defaults = Object.fromEntries(PARAM_DEFS[active].map(d => [d.key, d.default]));
                setParams(defaults);
                Object.entries(defaults).forEach(([k, v]) => bundleRef.current?.setParam(k, v));
              }}
              className="w-full py-1.5 font-mono text-[10px] text-white/30 border border-white/12 hover:text-white/55 hover:border-white/25 transition-colors"
            >
              reset defaults
            </button>
          </div>
          )}
        </div>
      )}

      {/* Active world info */}
      <div className="absolute bottom-6 left-6 z-10 font-mono text-xs text-white/30 space-y-1">
        <div className="text-white/50">{activeWorld.label}</div>
        <div>{activeWorld.desc}</div>
        <span ref={dominantZoneRef} className="text-cyan-400/60" />
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
