import type { SliderValues } from "@/lib/audio/instrument-synth";
import { DUB_CHORDS } from "@/lib/audio/instrument-synth";

export class DubChordSynth {
  private filter: BiquadFilterNode | null = null;
  private delay:  DelayNode | null = null;
  private fb:     GainNode  | null = null;
  private master: GainNode  | null = null;
  private initialized = false;
  private lastChordIdx = 0;
  private _amplitude = 0;

  private init(ctx: AudioContext): void {
    if (this.initialized) return;
    this.initialized = true;

    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 1200;
    this.filter.Q.value = 1.4;

    this.delay = ctx.createDelay(1.0);
    this.delay.delayTime.value = 0.35;

    this.fb = ctx.createGain();
    this.fb.gain.value = 0.28;

    this.master = ctx.createGain();
    this.master.gain.value = 0.09;

    // Signal chain: filter → master → destination
    this.filter.connect(this.master);
    this.master.connect(ctx.destination);

    // Delay feedback loop: master → delay → fb → delay (feedback)
    //                                         ↘ master (wet signal)
    this.master.connect(this.delay);
    this.delay.connect(this.fb);
    this.fb.connect(this.delay);
    this.fb.connect(this.master);
  }

  trigger(sliders: SliderValues, ctx: AudioContext | null, cursorNY?: number): void {
    if (!ctx) return;
    this.init(ctx);
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const chordIdx = this.lastChordIdx;
    this.lastChordIdx = (chordIdx + 1) % DUB_CHORDS.length;

    const attackSec = 0.005 + (sliders.atck / 100) * 0.495;
    const relSec    = 0.05  + (sliders.rel  / 100) * 1.95;
    const filterHz  = 200   + (sliders.filt / 100) * 7800;
    const masterVol = (sliders.chd / 100) * 0.18;
    const cursorCutoff = cursorNY !== undefined ? 600 + (1 - cursorNY) * 1400 : 1200;
    const effectiveCutoff = Math.min(filterHz, cursorCutoff + filterHz * 0.3);

    const t = ctx.currentTime;
    this.filter!.frequency.setTargetAtTime(effectiveCutoff, t, 0.02);
    this.master!.gain.setTargetAtTime(masterVol, t, 0.01);

    const freqs = DUB_CHORDS[chordIdx];
    const voiceVol = masterVol / 3;

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const vg  = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      vg.gain.setValueAtTime(0, t);
      vg.gain.linearRampToValueAtTime(voiceVol, t + attackSec);
      vg.gain.setTargetAtTime(0, t + attackSec, relSec / 3);
      osc.connect(vg);
      vg.connect(this.filter!);
      const stopAt = t + attackSec + relSec * 3;
      osc.start(t); osc.stop(stopAt);
      osc.onended = () => { try { osc.disconnect(); vg.disconnect(); } catch { /* ok */ } };
    });

    this._amplitude = 1.0;
  }

  getFeedback(): { amplitude: number; pitch: number } {
    this._amplitude *= 0.88;
    return { amplitude: this._amplitude, pitch: DUB_CHORDS[this.lastChordIdx][0] };
  }

  dispose(): void {
    try {
      this.filter?.disconnect();
      this.delay?.disconnect();
      this.fb?.disconnect();
      this.master?.disconnect();
    } catch { /* ok */ }
    this.initialized = false;
  }
}
