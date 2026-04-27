/**
 * Sound Effects Generator using Web Audio API
 *
 * Creates procedural sound effects without external audio files.
 * Falls back gracefully if AudioContext is not available.
 */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

/**
 * Play a simple tone with envelope.
 */
function playTone(frequency, duration, type = 'sine', volume = 0.15) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

/**
 * Play a sequence of tones.
 */
function playSequence(notes, type = 'sine', volume = 0.12) {
  const ctx = getAudioContext();
  if (!ctx) return;

  let time = ctx.currentTime;
  for (const [freq, dur] of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + dur);
    time += dur * 0.8;
  }
}

/**
 * Play noise burst (for death, explosion effects).
 */
function playNoise(duration = 0.3, volume = 0.1) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

// ===== Public Sound Effects =====

export function playMoveSound() {
  playTone(200, 0.08, 'sine', 0.08);
  setTimeout(() => playTone(280, 0.06, 'sine', 0.06), 50);
}

export function playBumpSound() {
  playTone(100, 0.15, 'square', 0.08);
}

export function playShootSound() {
  playTone(800, 0.1, 'sawtooth', 0.1);
  setTimeout(() => playTone(600, 0.1, 'sawtooth', 0.08), 80);
  setTimeout(() => playTone(400, 0.15, 'sawtooth', 0.06), 160);
}

export function playHitSound() {
  playSequence([
    [600, 0.1],
    [800, 0.1],
    [1000, 0.15],
    [500, 0.3],
  ], 'square', 0.1);
}

export function playDeathSound() {
  playNoise(0.4, 0.12);
  setTimeout(() => {
    playSequence([
      [400, 0.2],
      [300, 0.2],
      [200, 0.3],
      [100, 0.5],
    ], 'sawtooth', 0.1);
  }, 200);
}

export function playGrabGoldSound() {
  playSequence([
    [523, 0.1],
    [659, 0.1],
    [784, 0.1],
    [1047, 0.2],
  ], 'sine', 0.12);
}

export function playWinSound() {
  playSequence([
    [523, 0.15],
    [659, 0.15],
    [784, 0.15],
    [1047, 0.15],
    [1319, 0.15],
    [1568, 0.3],
  ], 'sine', 0.12);
}

export function playPerceptSound() {
  playTone(350, 0.15, 'sine', 0.05);
}
