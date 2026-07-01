import { SoundProfile } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // Lazy initialize to bypass browser autoplay policies
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  // Resume if suspended (common in browsers)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playKeySound(profile: SoundProfile, isSpace: boolean = false, volume: number = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (profile === 'mechanical') {
    // Mechanical click: combination of a high-pass noise pop and a short sine chime
    
    // 1. Noise transient for key cap impact
    const bufferSize = ctx.sampleRate * 0.015; // 15ms buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2500, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08 * volume, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001 * volume, now + 0.015);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    // 2. Short metallic ring
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = 'triangle';
    const pitch = isSpace ? 150 : 220 + Math.random() * 80;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.9, now + 0.04);

    oscGain.gain.setValueAtTime(0.04 * volume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001 * volume, now + 0.04);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  } 
  
  else if (profile === 'click') {
    // Soft electronic click
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    const pitch = isSpace ? 400 : 800 + Math.random() * 300;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, now + 0.012);

    gainNode.gain.setValueAtTime(0.06 * volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001 * volume, now + 0.012);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.012);
  } 
  
  else if (profile === 'typewriter') {
    // Old school deep metal snap
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'sawtooth';
    const pitch = isSpace ? 100 : 180 + Math.random() * 40;
    osc.frequency.setValueAtTime(pitch, now);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.Q.setValueAtTime(3, now);

    oscGain.gain.setValueAtTime(0.03 * volume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001 * volume, now + 0.05);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export function playErrorSound(volume: number = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(110, now); // Low buzz

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(220, now);

  gainNode.gain.setValueAtTime(0.07 * volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001 * volume, now + 0.12);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.12);
}
