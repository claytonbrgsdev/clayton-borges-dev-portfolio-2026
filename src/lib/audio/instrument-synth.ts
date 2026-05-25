/**
 * instrument-synth.ts
 * Synthesizer classes for InstrumentSketch.tsx — one per visual mode.
 * Pure Web Audio API; no React, no external dependencies.
 */

// ── Exported types ─────────────────────────────────────────────────────────────

export interface KnobValues { dens: number; rate: number; mod: number; }

export interface SliderValues extends KnobValues {
  atck: number;  // 0–100
  rel:  number;  // 0–100
  filt: number;  // 0–100
  chd:  number;  // 0–100
}
export interface CursorAudio { nx: number; ny: number; active: boolean; }
export interface AudioFeedback {
  amplitude: number;    // 0–1, envelope output
  pitch: number;        // Hz currently playing (0 if silent)
  voiceCount: number;   // active polyphonic voices (for NODE)
  filterCutoff: number; // Hz of active filter
}
export interface ModeSynth {
  onCursorMove(cursor: CursorAudio, knobs: KnobValues, ctx: AudioContext): void;
  onCursorLeave(ctx: AudioContext): void;
  onCursorClick?(cursor: CursorAudio, knobs: KnobValues, ctx: AudioContext): void;
  tick?(cursor: CursorAudio, knobs: KnobValues, ctx: AudioContext, dt: number, extra?: Record<string, unknown>): void;
  getFeedback(): AudioFeedback;
  dispose(ctx: AudioContext): void;
}

export const PENTATONIC_A_MINOR: readonly number[] = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33];

export const DUB_CHORDS: readonly (readonly number[])[] = [
  [220.00, 261.63, 329.63],  // Am: A3, C4, E4
  [174.61, 220.00, 261.63],  // Dm: F3, A3, C4
  [164.81, 196.00, 246.94],  // Em: E3, G3, B3
];

export function pitchFromNX(nx: number, scale: readonly number[]): number {
  const idx = Math.floor(nx * scale.length);
  return scale[Math.min(idx, scale.length - 1)];
}

// ── MeshSynth (M01 — Pad Drone) ───────────────────────────────────────────────

export class MeshSynth implements ModeSynth {
  private osc: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private vcaGain: GainNode | null = null;
  private delayA: DelayNode | null = null;
  private feedbackGainA: GainNode | null = null;
  private delayB: DelayNode | null = null;
  private feedbackGainB: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private initialized = false;
  private currentAmp = 0;

  private init(ctx: AudioContext): void {
    if (this.initialized) return;
    this.initialized = true;

    this.osc         = ctx.createOscillator();
    this.filter      = ctx.createBiquadFilter();
    this.vcaGain     = ctx.createGain();
    this.delayA      = ctx.createDelay(2.0);
    this.feedbackGainA = ctx.createGain();
    this.delayB      = ctx.createDelay(2.0);
    this.feedbackGainB = ctx.createGain();
    this.masterGain  = ctx.createGain();

    this.osc.type = "sawtooth";
    this.osc.frequency.value = PENTATONIC_A_MINOR[0];

    this.filter.type = "lowpass";
    this.filter.frequency.value = 800;
    this.filter.Q.value = 1.0;

    this.vcaGain.gain.value = 0.05;

    this.delayA.delayTime.value = 0.32;
    this.feedbackGainA.gain.value = 0.4;
    this.delayB.delayTime.value = 0.55;
    this.feedbackGainB.gain.value = 0.3;
    this.masterGain.gain.value = 0;

    // Signal chain
    this.osc.connect(this.filter);
    this.filter.connect(this.vcaGain);

    // Reverb A
    this.vcaGain.connect(this.delayA);
    this.delayA.connect(this.feedbackGainA);
    this.feedbackGainA.connect(this.delayA);
    this.delayA.connect(this.masterGain);

    // Reverb B
    this.vcaGain.connect(this.delayB);
    this.delayB.connect(this.feedbackGainB);
    this.feedbackGainB.connect(this.delayB);
    this.delayB.connect(this.masterGain);

    // Dry
    this.vcaGain.connect(this.masterGain);

    this.masterGain.connect(ctx.destination);
    this.osc.start();
  }

  onCursorMove(cursor: CursorAudio, knobs: KnobValues, ctx: AudioContext): void {
    this.init(ctx);
    if (!this.osc || !this.filter || !this.masterGain) return;

    const freq   = pitchFromNX(cursor.nx, PENTATONIC_A_MINOR);
    const cutoff = 200 + (1 - cursor.ny) * 2200;
    const q      = 0.5 + (knobs.mod / 100) * 7.5;
    const vol    = 0.12 * (0.3 + 0.7 * knobs.dens / 100);

    const t = ctx.currentTime;
    this.osc.frequency.linearRampToValueAtTime(freq,   t + 0.03);
    this.filter.frequency.linearRampToValueAtTime(cutoff, t + 0.03);
    this.filter.Q.value = q;

    if (!cursor.active) {
      this.masterGain.gain.linearRampToValueAtTime(0, t + 0.4);
    } else {
      this.masterGain.gain.linearRampToValueAtTime(vol, t + 0.03);
    }
  }

  onCursorLeave(ctx: AudioContext): void {
    if (!this.masterGain) return;
    this.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
  }

  tick(_cursor: CursorAudio, _knobs: KnobValues, _ctx: AudioContext, _dt: number): void {
    if (this.masterGain) {
      const target = this.masterGain.gain.value;
      this.currentAmp += (target - this.currentAmp) * 0.1;
    }
  }

  getFeedback(): AudioFeedback {
    return {
      amplitude:   this.currentAmp,
      pitch:       this.osc?.frequency.value ?? 0,
      voiceCount:  0,
      filterCutoff: this.filter?.frequency.value ?? 800,
    };
  }

  dispose(_ctx: AudioContext): void {
    try { this.osc?.stop(); } catch { /* already stopped */ }
    try {
      this.osc?.disconnect();
      this.filter?.disconnect();
      this.vcaGain?.disconnect();
      this.delayA?.disconnect();
      this.feedbackGainA?.disconnect();
      this.delayB?.disconnect();
      this.feedbackGainB?.disconnect();
      this.masterGain?.disconnect();
    } catch { /* ignore */ }
    this.osc = null;
    this.filter = null;
    this.vcaGain = null;
    this.delayA = null;
    this.feedbackGainA = null;
    this.delayB = null;
    this.feedbackGainB = null;
    this.masterGain = null;
    this.initialized = false;
  }
}

// ── OrbitSynth (M02 — Arpeggio) ──────────────────────────────────────────────

export class OrbitSynth implements ModeSynth {
  private lastBucket = -1;
  private lastNoteTime = 0;
  private amplitude = 0;
  private lastPitch = 0;
  private readonly minGate = 0.08; // seconds

  onCursorMove(cursor: CursorAudio, knobs: KnobValues, ctx: AudioContext): void {
    if (!cursor.active) return;

    const angle  = ((Math.atan2(cursor.ny - 0.5, cursor.nx - 0.5) + 2 * Math.PI) % (2 * Math.PI));
    const bucket = Math.floor(angle / (2 * Math.PI / 8));

    const now = ctx.currentTime;
    if (bucket !== this.lastBucket && (now - this.lastNoteTime) >= this.minGate) {
      this.lastBucket   = bucket;
      this.lastNoteTime = now;
      this.fireNote(cursor, knobs, ctx, bucket);
    }
  }

  private fireNote(cursor: CursorAudio, _knobs: KnobValues, ctx: AudioContext, bucket: number): void {
    const freq = PENTATONIC_A_MINOR[bucket % PENTATONIC_A_MINOR.length];
    const dist = Math.sqrt((cursor.nx - 0.5) ** 2 + (cursor.ny - 0.5) ** 2);
    const vol  = 0.15 * Math.min(1, dist * 2.5);

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.005);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.200);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);

    this.amplitude = 1.0;
    this.lastPitch = freq;

    osc.addEventListener("ended", () => {
      try { osc.disconnect(); gain.disconnect(); } catch { /* gone */ }
    });
  }

  onCursorLeave(_ctx: AudioContext): void {
    this.lastBucket = -1;
  }

  tick(_cursor: CursorAudio, _knobs: KnobValues, _ctx: AudioContext, _dt: number): void {
    this.amplitude *= 0.90;
  }

  getFeedback(): AudioFeedback {
    return {
      amplitude:   this.amplitude,
      pitch:       this.lastPitch,
      voiceCount:  0,
      filterCutoff: 800,
    };
  }

  dispose(_ctx: AudioContext): void {
    this.lastBucket   = -1;
    this.lastNoteTime = 0;
    this.amplitude    = 0;
  }
}

// ── FlowSynth (M04 — Theremin) ────────────────────────────────────────────────

export class FlowSynth implements ModeSynth {
  private osc: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private vca: GainNode | null = null;
  private initialized = false;

  private init(ctx: AudioContext): void {
    if (this.initialized) return;
    this.initialized = true;

    this.osc    = ctx.createOscillator();
    this.filter = ctx.createBiquadFilter();
    this.vca    = ctx.createGain();

    this.osc.type = "sine";
    this.osc.frequency.value = 440;
    this.filter.type = "lowpass";
    this.filter.frequency.value = 4000;
    this.vca.gain.value = 0;

    this.osc.connect(this.filter);
    this.filter.connect(this.vca);
    this.vca.connect(ctx.destination);
    this.osc.start();
  }

  onCursorMove(cursor: CursorAudio, knobs: KnobValues, ctx: AudioContext): void {
    this.init(ctx);
    if (!this.osc || !this.filter || !this.vca) return;

    const idx  = Math.round(cursor.nx * (PENTATONIC_A_MINOR.length - 1));
    const freq = PENTATONIC_A_MINOR[Math.min(idx, PENTATONIC_A_MINOR.length - 1)];
    const cutoff = 400 + (1 - cursor.ny) * 7600;
    const vol    = 0.2 * (1 - cursor.ny * 0.7);

    if (knobs.mod > 50) {
      this.osc.type = "triangle";
    } else {
      this.osc.type = "sine";
    }
    this.osc.detune.value = (knobs.dens - 50);

    const t = ctx.currentTime;
    this.osc.frequency.linearRampToValueAtTime(freq,   t + 0.008);
    this.filter.frequency.linearRampToValueAtTime(cutoff, t + 0.008);
    this.vca.gain.linearRampToValueAtTime(vol, t + 0.008);
  }

  onCursorLeave(ctx: AudioContext): void {
    if (!this.vca) return;
    this.vca.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
  }

  getFeedback(): AudioFeedback {
    return {
      amplitude:   this.vca?.gain.value ?? 0,
      pitch:       this.osc?.frequency.value ?? 0,
      voiceCount:  0,
      filterCutoff: this.filter?.frequency.value ?? 800,
    };
  }

  dispose(_ctx: AudioContext): void {
    try { this.osc?.stop(); } catch { /* already stopped */ }
    try {
      this.osc?.disconnect();
      this.filter?.disconnect();
      this.vca?.disconnect();
    } catch { /* ignore */ }
    this.osc    = null;
    this.filter = null;
    this.vca    = null;
    this.initialized = false;
  }
}

// ── LissSynth (M05 — Dual Oscillator) ────────────────────────────────────────

export class LissSynth implements ModeSynth {
  private oscA: OscillatorNode | null = null;
  private oscB: OscillatorNode | null = null;
  private gainA: GainNode | null = null;
  private gainB: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private initialized = false;
  private readonly baseFreq = 82.5;
  private lastA = 1;

  private init(ctx: AudioContext): void {
    if (this.initialized) return;
    this.initialized = true;

    this.oscA       = ctx.createOscillator();
    this.oscB       = ctx.createOscillator();
    this.gainA      = ctx.createGain();
    this.gainB      = ctx.createGain();
    this.masterGain = ctx.createGain();

    this.oscA.type = "sine";
    this.oscB.type = "sine";
    this.oscA.frequency.value = this.baseFreq;
    this.oscB.frequency.value = this.baseFreq;
    this.gainA.gain.value = 0.3;
    this.gainB.gain.value = 0.3;
    this.masterGain.gain.value = 0;

    this.oscA.connect(this.gainA);
    this.oscB.connect(this.gainB);
    this.gainA.connect(this.masterGain);
    this.gainB.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);

    this.oscA.start();
    this.oscB.start();
  }

  onCursorMove(cursor: CursorAudio, knobs: KnobValues, ctx: AudioContext): void {
    this.init(ctx);
    if (!this.oscB || !this.masterGain) return;

    this.oscB.detune.value = (cursor.nx - 0.5) * 200;

    const vol = 0.18 * (0.15 + 0.85 * (1 - cursor.ny));
    this.masterGain.gain.linearRampToValueAtTime(
      cursor.active ? vol : 0,
      ctx.currentTime + 0.05,
    );

    // Also update frequencies based on knobs so they stay in sync
    const a     = 1 + Math.floor((knobs.rate / 100) * 5.99);
    const bMult = 1 + (knobs.mod / 100) * 2;
    if (this.oscA) {
      this.oscA.frequency.linearRampToValueAtTime(this.baseFreq * a, ctx.currentTime + 0.05);
    }
    this.oscB.frequency.linearRampToValueAtTime(this.baseFreq * bMult, ctx.currentTime + 0.05);
  }

  onCursorLeave(ctx: AudioContext): void {
    if (!this.masterGain) return;
    this.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
  }

  tick(_cursor: CursorAudio, knobs: KnobValues, ctx: AudioContext, _dt: number): void {
    if (!this.oscA || !this.oscB || !this.masterGain) return;

    const a     = 1 + Math.floor((knobs.rate / 100) * 5.99);
    const bMult = 1 + (knobs.mod / 100) * 2;

    if (a !== this.lastA) {
      this.lastA = a;
      this.oscA.frequency.linearRampToValueAtTime(this.baseFreq * a, ctx.currentTime + 0.05);
    }
    this.oscB.frequency.linearRampToValueAtTime(this.baseFreq * bMult, ctx.currentTime + 0.05);
  }

  getFeedback(): AudioFeedback {
    return {
      amplitude:   this.masterGain?.gain.value ?? 0,
      pitch:       this.oscA?.frequency.value ?? 0,
      voiceCount:  0,
      filterCutoff: 800,
    };
  }

  dispose(_ctx: AudioContext): void {
    try { this.oscA?.stop(); this.oscB?.stop(); } catch { /* already stopped */ }
    try {
      this.oscA?.disconnect();
      this.oscB?.disconnect();
      this.gainA?.disconnect();
      this.gainB?.disconnect();
      this.masterGain?.disconnect();
    } catch { /* ignore */ }
    this.oscA       = null;
    this.oscB       = null;
    this.gainA      = null;
    this.gainB      = null;
    this.masterGain = null;
    this.initialized = false;
  }
}

// ── NodeSynth (M06 — Polyphonic) ──────────────────────────────────────────────

interface NodePosition { x: number; y: number; }

export class NodeSynth implements ModeSynth {
  private nodeFiredAt: Map<number, number> = new Map();
  private activeVoices = 0;
  private amplitude = 0;
  private lastPitch = 0;
  private masterGain: GainNode | null = null;
  private filter:     BiquadFilterNode | null = null;
  private delayA:     DelayNode | null = null;
  private delayB:     DelayNode | null = null;
  private fbGainA:    GainNode  | null = null;
  private fbGainB:    GainNode  | null = null;
  private initialized = false;

  private init(ctx: AudioContext): void {
    if (this.initialized) return;
    this.initialized = true;

    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 2400;
    this.filter.Q.value = 1.2;

    this.delayA = ctx.createDelay(2.0);
    this.delayA.delayTime.value = 0.25;
    this.fbGainA = ctx.createGain();
    this.fbGainA.gain.value = 0.22;

    this.delayB = ctx.createDelay(2.0);
    this.delayB.delayTime.value = 0.45;
    this.fbGainB = ctx.createGain();
    this.fbGainB.gain.value = 0.18;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.5;

    // filter → dry path + reverb paths → master → destination
    this.filter.connect(this.masterGain);

    this.filter.connect(this.delayA);
    this.delayA.connect(this.fbGainA);
    this.fbGainA.connect(this.delayA);
    this.delayA.connect(this.masterGain);

    this.filter.connect(this.delayB);
    this.delayB.connect(this.fbGainB);
    this.fbGainB.connect(this.delayB);
    this.delayB.connect(this.masterGain);

    this.masterGain.connect(ctx.destination);
  }

  onCursorMove(_cursor: CursorAudio, _knobs: KnobValues, _ctx: AudioContext): void {
    // NodeSynth triggers via tick based on proximity
  }

  onCursorLeave(_ctx: AudioContext): void {
    // Nothing to release — voices are fire-and-forget
  }

  tick(cursor: CursorAudio, knobs: KnobValues, ctx: AudioContext, _dt: number, extra?: Record<string, unknown>): void {
    this.init(ctx);
    // Update filter cutoff from WARMTH (filt) slider in real time
    if (this.filter && 'filt' in knobs) {
      const warmth = (knobs as SliderValues).filt;
      const filterHz = 200 + (warmth / 100) * 7800;
      this.filter.frequency.setTargetAtTime(filterHz, ctx.currentTime, 0.05);
    }

    if (!extra) return;
    const nodes  = extra.nodes  as NodePosition[] | undefined;
    const width  = extra.width  as number | undefined;
    const height = extra.height as number | undefined;
    if (!nodes || !width || !height) return;

    const maxVoices = 1 + Math.floor((knobs.dens / 100) * 3);
    const now       = ctx.currentTime;
    const cooldown  = 0.3; // seconds

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nx   = node.x / width;
      const ny   = node.y / height;
      const dist = Math.sqrt((nx - cursor.nx) ** 2 + (ny - cursor.ny) ** 2);

      if (dist < 0.12) {
        const lastFired = this.nodeFiredAt.get(i) ?? -Infinity;
        if (now - lastFired >= cooldown && this.activeVoices < maxVoices) {
          const vol  = 0.15 * (1 - dist / 0.12);
          const chordIdx = (i % 16) % 3;
          const voiceIdx = i % 3;
          const freq = DUB_CHORDS[chordIdx][voiceIdx];

          this.nodeFiredAt.set(i, now);
          this.fireVoice(ctx, freq, vol);
        }
      }
    }

    // Decay amplitude
    this.amplitude *= 0.92;
  }

  private fireVoice(ctx: AudioContext, freq: number, vol: number): void {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    if (this.filter) {
      gain.connect(this.filter);
    } else {
      gain.connect(ctx.destination);
    }

    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.012);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.400);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.45);

    this.activeVoices++;
    this.amplitude = Math.max(this.amplitude, 1.0);
    this.lastPitch = freq;

    osc.addEventListener("ended", () => {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
      try { osc.disconnect(); gain.disconnect(); } catch { /* gone */ }
    });
  }

  triggerChord(beatStep: number, sliders: SliderValues, ctx: AudioContext): void {
    this.init(ctx);
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const chordIdx   = beatStep % 3;
    const freqs      = DUB_CHORDS[chordIdx];
    const warmth     = sliders.filt;
    const glow       = sliders.rel;
    const filterHz   = 200 + (warmth / 100) * 7800;
    const attackSec  = 0.008 + (glow / 100) * 0.08;
    const relSec     = 0.2   + (glow / 100) * 2.8;
    const voiceVol   = 0.08 + (sliders.chd / 100) * 0.12;

    const t = ctx.currentTime;
    this.filter!.frequency.setTargetAtTime(filterHz, t, 0.015);

    freqs.forEach((freq) => {
      [freq, freq * 2].forEach((f, octIdx) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = f;
        const vol = octIdx === 0 ? voiceVol : voiceVol * 0.25;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + attackSec);
        gain.gain.setTargetAtTime(0, t + attackSec, relSec / 3);
        osc.connect(gain);
        gain.connect(this.filter!);
        const stopAt = t + attackSec + relSec * 4;
        osc.start(t);
        osc.stop(stopAt);
        osc.onended = () => {
          try { osc.disconnect(); gain.disconnect(); } catch { /* ok */ }
        };
      });
    });

    this.amplitude = 1.0;
    this.lastPitch = freqs[0];
  }

  getFeedback(): AudioFeedback {
    return {
      amplitude:   this.amplitude,
      pitch:       this.lastPitch,
      voiceCount:  this.activeVoices,
      filterCutoff: 800,
    };
  }

  dispose(_ctx: AudioContext): void {
    this.nodeFiredAt.clear();
    this.activeVoices = 0;
    this.amplitude    = 0;
    this.lastPitch    = 0;
    try {
      this.filter?.disconnect();
      this.delayA?.disconnect();
      this.fbGainA?.disconnect();
      this.delayB?.disconnect();
      this.fbGainB?.disconnect();
      this.masterGain?.disconnect();
    } catch { /* ok */ }
    this.filter = null;
    this.delayA = null; this.fbGainA = null;
    this.delayB = null; this.fbGainB = null;
    this.masterGain = null;
    this.initialized = false;
  }
}
