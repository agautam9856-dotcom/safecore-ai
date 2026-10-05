"use client"

let isMuted = false;
export const toggleAudioMute = () => {
  isMuted = !isMuted;
  return isMuted;
}
export const getAudioMute = () => isMuted;

// Define a type for window extension safely to avoid eslint any error
type CustomWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

let audioCtx: AudioContext | null = null;
const getCtx = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const CtxClass = window.AudioContext || (window as CustomWindow).webkitAudioContext;
    if (CtxClass) audioCtx = new CtxClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const playCyberClick = () => {
  if (isMuted) return;
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.05);
  } catch {}
};

export const playCyberScan = () => {
  if (isMuted) return;
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 3.6);
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 3.6);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 3.6);
  } catch {}
};

export const playCyberComplete = () => {
  if (isMuted) return;
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 1);
  } catch {}
};
