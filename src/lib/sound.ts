"use client";

type Sound = "benar" | "salah" | "naik" | "klik";

let context: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (context) return context;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  context = new Ctor();
  return context;
}

function tone(ctx: AudioContext, frequency: number, start: number, duration: number, gain: number) {
  const oscillator = ctx.createOscillator();
  const volume = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  volume.gain.setValueAtTime(0, ctx.currentTime + start);
  volume.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.01);
  volume.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  oscillator.connect(volume);
  volume.connect(ctx.destination);
  oscillator.start(ctx.currentTime + start);
  oscillator.stop(ctx.currentTime + start + duration + 0.02);
}

/** Nada pendek yang dihasilkan WebAudio, tanpa berkas audio. */
export function playSound(kind: Sound, enabled: boolean): void {
  if (!enabled) return;
  const ctx = audioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  if (kind === "klik") {
    tone(ctx, 420, 0, 0.05, 0.04);
    return;
  }
  if (kind === "benar") {
    tone(ctx, 660, 0, 0.09, 0.05);
    tone(ctx, 880, 0.08, 0.12, 0.045);
    return;
  }
  if (kind === "salah") {
    tone(ctx, 220, 0, 0.16, 0.05);
    tone(ctx, 180, 0.12, 0.18, 0.04);
    return;
  }
  tone(ctx, 523, 0, 0.1, 0.05);
  tone(ctx, 659, 0.1, 0.1, 0.05);
  tone(ctx, 784, 0.2, 0.12, 0.05);
  tone(ctx, 1046, 0.32, 0.2, 0.05);
}
