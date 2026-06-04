/**
 * drum-synth.ts
 * Pure Web Audio API drum synthesis for DrumMachineSketch.
 * No React imports.
 */

export function makeNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const frames = ctx.sampleRate;
  const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

export function fireKick(ctx: AudioContext, vol: number, when: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(160, when);
  osc.frequency.exponentialRampToValueAtTime(40, when + 0.35);
  gain.gain.setValueAtTime(0.001, when);
  gain.gain.linearRampToValueAtTime(vol * 0.9, when + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.40);
  osc.start(when); osc.stop(when + 0.45);
  osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch { /* ignore */ } };
}

export function fireSnare(ctx: AudioContext, vol: number, when: number, noiseBuffer: AudioBuffer): void {
  // Tonal body
  const oscS = ctx.createOscillator();
  const gainS = ctx.createGain();
  oscS.type = "triangle";
  oscS.frequency.setValueAtTime(200, when);
  oscS.frequency.exponentialRampToValueAtTime(100, when + 0.12);
  gainS.gain.setValueAtTime(0.001, when);
  gainS.gain.linearRampToValueAtTime(vol * 0.45, when + 0.003);
  gainS.gain.exponentialRampToValueAtTime(0.001, when + 0.15);
  oscS.connect(gainS); gainS.connect(ctx.destination);
  oscS.start(when); oscS.stop(when + 0.18);
  oscS.onended = () => { try { oscS.disconnect(); gainS.disconnect(); } catch { /* ignore */ } };
  // Noise burst
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const filt = ctx.createBiquadFilter();
  filt.type = "highpass"; filt.frequency.value = 1500;
  const gainN = ctx.createGain();
  gainN.gain.setValueAtTime(0.001, when);
  gainN.gain.linearRampToValueAtTime(vol * 0.55, when + 0.002);
  gainN.gain.exponentialRampToValueAtTime(0.001, when + 0.18);
  src.connect(filt); filt.connect(gainN); gainN.connect(ctx.destination);
  src.start(when); src.stop(when + 0.20);
  src.onended = () => { try { src.disconnect(); filt.disconnect(); gainN.disconnect(); } catch { /* ignore */ } };
}

export function fireHiHat(ctx: AudioContext, vol: number, when: number, noiseBuffer: AudioBuffer): void {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const filt = ctx.createBiquadFilter();
  filt.type = "bandpass"; filt.frequency.value = 8000; filt.Q.value = 1.5;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, when);
  gain.gain.linearRampToValueAtTime(vol * 0.35, when + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.08);
  src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
  src.start(when); src.stop(when + 0.10);
  src.onended = () => { try { src.disconnect(); filt.disconnect(); gain.disconnect(); } catch { /* ignore */ } };
}

export function fireTom(ctx: AudioContext, vol: number, when: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, when);
  osc.frequency.exponentialRampToValueAtTime(60, when + 0.30);
  gain.gain.setValueAtTime(0.001, when);
  gain.gain.linearRampToValueAtTime(vol * 0.70, when + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.35);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(when); osc.stop(when + 0.40);
  osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch { /* ignore */ } };
}
