/**
 * WorldSynth — live A/V synthesis engine for the point-cloud world.
 *
 * 8 musical zones, each mapped to a region of the 3D scene.
 * Camera proximity drives zone GainNode weights in real-time.
 * All synthesis is pure Web Audio API — no external dependencies.
 *
 * Signal chain per zone:
 *   OscillatorNode → GainNode (envelope/VCA)
 *     → BiquadFilterNode (zone timbre)
 *     → DelayNode + feedback GainNode (delay effect)
 *     → zone GainNode (spatial weight)
 *     → master GainNode → AudioContext.destination
 */

// ── Scale definitions (semitone intervals from root) ─────────────────────────

const SCALES = {
  pentatonicMinor: [0, 3, 5, 7, 10],
  majorPentatonic: [0, 2, 4, 7, 9],
  dorian:          [0, 2, 3, 5, 7, 9, 10],
  phrygian:        [0, 1, 3, 5, 7, 8, 10],
  wholeTone:       [0, 2, 4, 6, 8, 10],
  diminished:      [0, 2, 3, 5, 6, 8, 9, 11],
  lydian:          [0, 2, 4, 6, 7, 9, 11],
  chromatic:       [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
} as const;

// ── Zone definitions ──────────────────────────────────────────────────────────

interface ZoneDef {
  id:             string;
  label:          string;
  scale:          readonly number[];
  rootHz:         number;
  oscType:        OscillatorType;
  octaves:        [number, number];    // [min, max] octave above root
  gateMin:        number;              // min seconds between note onsets
  gateMax:        number;
  filterType:     BiquadFilterType;
  filterHz:       number;
  filterQ:        number;
  delayTime:      number;             // seconds
  delayFeedback:  number;             // 0–0.85
  wetMix:         number;             // delay wet send (0–1)
  noteLen:        [number, number];   // [min, max] note duration (seconds)
  polyphony:      number;
}

export const ZONE_DEFS: ZoneDef[] = [
  {
    id: 'origin', label: 'Origin',
    scale: SCALES.pentatonicMinor, rootHz: 110,       // A2
    oscType: 'sine', octaves: [0, 2],
    gateMin: 4,  gateMax: 9,
    filterType: 'lowpass',  filterHz: 280,  filterQ: 1.2,
    delayTime: 0.75, delayFeedback: 0.55, wetMix: 0.45,
    noteLen: [2, 5], polyphony: 2,
  },
  {
    id: 'life', label: 'Life',
    scale: SCALES.majorPentatonic, rootHz: 130.8,     // C3
    oscType: 'triangle', octaves: [1, 3],
    gateMin: 2,  gateMax: 6,
    filterType: 'bandpass', filterHz: 900,  filterQ: 2.0,
    delayTime: 0.35, delayFeedback: 0.40, wetMix: 0.35,
    noteLen: [1, 3], polyphony: 3,
  },
  {
    id: 'geology', label: 'Geology',
    scale: SCALES.dorian, rootHz: 73.4,               // D2
    oscType: 'sawtooth', octaves: [0, 1],
    gateMin: 5,  gateMax: 12,
    filterType: 'lowpass',  filterHz: 400,  filterQ: 0.8,
    delayTime: 0.90, delayFeedback: 0.45, wetMix: 0.40,
    noteLen: [3, 7], polyphony: 2,
  },
  {
    id: 'deep', label: 'Deep',
    scale: SCALES.phrygian, rootHz: 61.7,             // B1
    oscType: 'sine', octaves: [0, 1],
    gateMin: 6,  gateMax: 15,
    filterType: 'lowpass',  filterHz: 180,  filterQ: 3.0,
    delayTime: 1.20, delayFeedback: 0.65, wetMix: 0.55,
    noteLen: [4, 9], polyphony: 2,
  },
  {
    id: 'ice', label: 'Ice',
    scale: SCALES.wholeTone, rootHz: 82.4,            // E2
    oscType: 'triangle', octaves: [1, 3],
    gateMin: 7,  gateMax: 16,
    filterType: 'highpass', filterHz: 500,  filterQ: 1.0,
    delayTime: 1.60, delayFeedback: 0.70, wetMix: 0.60,
    noteLen: [3, 8], polyphony: 1,
  },
  {
    id: 'fire', label: 'Fire',
    scale: SCALES.diminished, rootHz: 92.5,           // F#2
    oscType: 'sawtooth', octaves: [0, 2],
    gateMin: 1,  gateMax: 4,
    filterType: 'bandpass', filterHz: 320,  filterQ: 2.5,
    delayTime: 0.25, delayFeedback: 0.35, wetMix: 0.30,
    noteLen: [0.5, 2], polyphony: 3,
  },
  {
    id: 'scan', label: 'Scan',
    scale: SCALES.lydian, rootHz: 196,                // G3
    oscType: 'square', octaves: [0, 2],
    gateMin: 2,  gateMax: 7,
    filterType: 'bandpass', filterHz: 1200, filterQ: 4.0,
    delayTime: 0.50, delayFeedback: 0.30, wetMix: 0.28,
    noteLen: [1, 3], polyphony: 2,
  },
  {
    id: 'sky', label: 'Sky',
    scale: SCALES.chromatic, rootHz: 220,             // A3
    oscType: 'sine', octaves: [1, 3],
    gateMin: 3,  gateMax: 8,
    filterType: 'highpass', filterHz: 1000, filterQ: 0.5,
    delayTime: 1.00, delayFeedback: 0.60, wetMix: 0.50,
    noteLen: [2, 6], polyphony: 2,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function semitoneToHz(rootHz: number, semitone: number, octave: number): number {
  return rootHz * Math.pow(2, (semitone + octave * 12) / 12);
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// ── ZonePlayer ────────────────────────────────────────────────────────────────

class ZonePlayer {
  private def:     ZoneDef;
  private ctx:     AudioContext;
  readonly gain:   GainNode;          // weight-controlled output
  private filter:  BiquadFilterNode;
  private delay:   DelayNode;
  private fbGain:  GainNode;
  private wetSend: GainNode;
  private nextAt:  number = 0;
  private voices:  number = 0;

  constructor(def: ZoneDef, ctx: AudioContext, master: GainNode) {
    this.def = def;
    this.ctx = ctx;

    // Zone output gain (0 = silent, 1 = full)
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;

    // Timbre filter
    this.filter = ctx.createBiquadFilter();
    this.filter.type            = def.filterType;
    this.filter.frequency.value = def.filterHz;
    this.filter.Q.value         = def.filterQ;

    // Delay network: filter → wet send → delay → feedback → delay (loop)
    //                                   delay → zone gain
    this.delay  = ctx.createDelay(4.0);
    this.delay.delayTime.value = def.delayTime;
    this.fbGain = ctx.createGain();
    this.fbGain.gain.value = def.delayFeedback;
    this.wetSend = ctx.createGain();
    this.wetSend.gain.value = def.wetMix;

    this.filter.connect(this.gain);          // dry path
    this.filter.connect(this.wetSend);       // wet send
    this.wetSend.connect(this.delay);
    this.delay.connect(this.fbGain);
    this.fbGain.connect(this.delay);         // feedback loop
    this.delay.connect(this.gain);           // delay output → zone gain
    this.gain.connect(master);
  }

  setWeight(w: number): void {
    this.gain.gain.setTargetAtTime(
      w * 0.30,             // max level per zone (headroom for mixing)
      this.ctx.currentTime,
      0.8,                  // 0.8 s time constant — smooth crossfade
    );
  }

  /** Call every ~80 ms; schedules any notes that fall within lookahead window. */
  tick(): void {
    const now = this.ctx.currentTime;
    // Initialise nextAt on first tick
    if (this.nextAt === 0) {
      this.nextAt = now + rand(0, 2.5); // stagger zone starts
    }
    // Schedule everything within the 250 ms lookahead
    while (this.nextAt < now + 0.25) {
      if (this.voices < this.def.polyphony) {
        this.scheduleNote(this.nextAt);
      }
      this.nextAt += rand(this.def.gateMin, this.def.gateMax);
    }
  }

  private scheduleNote(at: number): void {
    const def      = this.def;
    const semitone = def.scale[Math.floor(Math.random() * def.scale.length)];
    const octave   = Math.floor(rand(def.octaves[0], def.octaves[1] + 0.999));
    const freq     = semitoneToHz(def.rootHz, semitone, octave);
    const dur      = rand(def.noteLen[0], def.noteLen[1]);
    const attack   = Math.min(0.15, dur * 0.15);
    const release  = Math.min(0.9,  dur * 0.30);

    const osc  = this.ctx.createOscillator();
    const vca  = this.ctx.createGain();

    osc.type            = def.oscType;
    osc.frequency.value = freq;
    osc.detune.value    = (Math.random() - 0.5) * 10; // ±5 cents warmth

    vca.gain.value = 0;
    osc.connect(vca);
    vca.connect(this.filter);

    osc.start(at);
    vca.gain.setValueAtTime(0, at);
    vca.gain.linearRampToValueAtTime(0.28, at + attack);
    vca.gain.setValueAtTime(0.28, at + dur - release);
    vca.gain.linearRampToValueAtTime(0, at + dur);
    osc.stop(at + dur + 0.05);

    this.voices++;
    osc.addEventListener('ended', () => {
      this.voices = Math.max(0, this.voices - 1);
      try { osc.disconnect(); vca.disconnect(); } catch { /* already gone */ }
    });
  }

  dispose(): void {
    try {
      this.gain.disconnect();
      this.filter.disconnect();
      this.delay.disconnect();
      this.fbGain.disconnect();
      this.wetSend.disconnect();
    } catch { /* ignore */ }
  }
}

// ── WorldSynth (public API) ───────────────────────────────────────────────────

export class WorldSynth {
  private ctx:     AudioContext | null = null;
  private master:  GainNode    | null = null;
  private players: Map<string, ZonePlayer> = new Map();
  private tickId:  ReturnType<typeof setInterval> | null = null;

  get ready(): boolean { return this.ctx !== null; }

  /** Call once from a user-gesture handler (browser AudioContext policy). */
  init(): void {
    if (this.ctx) return;

    this.ctx    = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.7;
    this.master.connect(this.ctx.destination);

    for (const def of ZONE_DEFS) {
      const p = new ZonePlayer(def, this.ctx, this.master);
      this.players.set(def.id, p);
    }

    // Scheduling tick — runs every 80 ms, negligible CPU cost
    this.tickId = setInterval(() => {
      if (this.ctx?.state === 'suspended') this.ctx.resume();
      for (const p of this.players.values()) p.tick();
    }, 80);
  }

  /**
   * Set the blend weight (0–1) for a zone based on camera proximity.
   * Call every animation frame. Smoothing is handled internally.
   */
  setZoneWeight(id: string, weight: number): void {
    this.players.get(id)?.setWeight(weight);
  }

  setMasterVolume(v: number): void {
    if (!this.master || !this.ctx) return;
    this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1);
  }

  dispose(): void {
    if (this.tickId != null) clearInterval(this.tickId);
    this.tickId = null;
    this.players.forEach(p => p.dispose());
    this.players.clear();
    void this.ctx?.close();
    this.ctx  = null;
    this.master = null;
  }
}
