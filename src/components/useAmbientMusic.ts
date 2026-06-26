import { useEffect, useRef } from "react";

// Pentatonic scale — C5 pentatonic
const NOTES = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66];

// Chord progressions: C maj → A min → F maj → G maj
const CHORDS = [
  [261.63, 329.63, 392.00],
  [220.00, 261.63, 329.63],
  [174.61, 220.00, 261.63],
  [196.00, 246.94, 293.66],
];

function buildAmbientTrack(ctx: AudioContext): () => void {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 2.5);

  const delay = ctx.createDelay(0.6);
  delay.delayTime.value = 0.35;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.38;
  const delayDry = ctx.createGain();
  delayDry.gain.value = 0.55;
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(delayDry);
  delayDry.connect(master);
  master.connect(ctx.destination);

  const CHORD_DUR = 2.8;
  let t = ctx.currentTime + 0.1;

  for (let bar = 0; bar < 12; bar++) {
    const chord = CHORDS[bar % CHORDS.length];
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.28, t + 0.5);
      env.gain.setValueAtTime(0.22, t + CHORD_DUR - 0.6);
      env.gain.linearRampToValueAtTime(0, t + CHORD_DUR);
      osc.connect(env); env.connect(delay);
      osc.start(t); osc.stop(t + CHORD_DUR + 0.1);
    });

    const melodyNote = NOTES[(bar * 3) % NOTES.length];
    const mOsc = ctx.createOscillator();
    mOsc.type = "triangle";
    mOsc.frequency.value = melodyNote;
    const mEnv = ctx.createGain();
    const mOffset = CHORD_DUR * 0.4;
    mEnv.gain.setValueAtTime(0, t + mOffset);
    mEnv.gain.linearRampToValueAtTime(0.12, t + mOffset + 0.08);
    mEnv.gain.linearRampToValueAtTime(0, t + mOffset + 0.7);
    mOsc.connect(mEnv); mEnv.connect(delay);
    mOsc.start(t + mOffset); mOsc.stop(t + mOffset + 0.8);

    t += CHORD_DUR;
  }

  return () => {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
  };
}

export function playSuccessChime(ctx: AudioContext) {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.18, ctx.currentTime);
  master.connect(ctx.destination);
  [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const env = ctx.createGain();
    const t = ctx.currentTime + i * 0.13;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.22, t + 0.06);
    env.gain.linearRampToValueAtTime(0, t + 0.55);
    osc.connect(env); env.connect(master);
    osc.start(t); osc.stop(t + 0.6);
  });
}

export function useAmbientMusic(active: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!active) {
      stopRef.current?.();
      stopRef.current = null;
      return;
    }
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume();
    stopRef.current = buildAmbientTrack(ctx);
    return () => {
      stopRef.current?.();
      stopRef.current = null;
      setTimeout(() => ctx.close(), 1500);
    };
  }, [active]);

  return ctxRef;
}
