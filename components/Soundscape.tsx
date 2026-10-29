"use client";

import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";

// CRT hum — 60Hz + faint noise, the sound of a monitor that never sleeps
function startCRTHum() {
  try {
    const ctx = new AudioContext();
    // 60Hz hum
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 60;
    osc.type = "sine";
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    // faint noise bed
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.02;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.03;
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();
    return () => {
      try {
        osc.stop();
        noise.stop();
        ctx.close();
      } catch { /* already closed */ }
    };
  } catch {
    return () => {};
  }
}

// system beep — the terminal "listens"
function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
    setTimeout(() => ctx.close(), 400);
  } catch { /* ignore */ }
}

// audio stinger — a sudden low distorted burst
function stinger() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.6);
    osc.type = "sawtooth";
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    const distort = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) curve[i] = Math.tanh((i / 128 - 1) * 3);
    distort.curve = curve;
    osc.connect(distort);
    distort.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.75);
    setTimeout(() => ctx.close(), 1000);
  } catch { /* ignore */ }
}

export default function Soundscape() {
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const [integrity, setIntegrity] = useState(100);
  const startedRef = useRef(false);
  const soundsRef = useRef<Howl[]>([]);

  // integrity from ArchiveIntegrity
  useEffect(() => {
    const onIntegrity = (e: Event) => {
      const detail = (e as CustomEvent).detail as { integrity?: number } | undefined;
      if (detail?.integrity !== undefined) setIntegrity(detail.integrity);
    };
    window.addEventListener("archive-integrity", onIntegrity);
    return () => window.removeEventListener("archive-integrity", onIntegrity);
  }, []);

  useEffect(() => {
    if (!started || startedRef.current) return;
    startedRef.current = true;

    const drone = new Howl({ src: ["/sfx/drone.mp3"], loop: true, volume: 0.25, html5: true });
    const whisper = new Howl({ src: ["/sfx/whisper.mp3"], volume: 0.3 });
    const scream = new Howl({ src: ["/sfx/scare.mp3"], volume: 0.5 });
    const wolfHowl = new Howl({ src: ["/sfx/howl.mp3"], volume: 0.4 });

    soundsRef.current = [drone, whisper, scream, wolfHowl];
    drone.play();

    const stopHum = startCRTHum();
    let lastStinger = 0;

    const onAnswer = () => {
      beep();
      // stingers when integrity is low
      if (integrity < 50 && Date.now() - lastStinger > 20000) {
        lastStinger = Date.now();
        stinger();
      }
    };
    window.addEventListener("ghost-answered", onAnswer);

    const whisperTimer = setInterval(() => {
      if (Math.random() < 0.7) whisper.play();
    }, 14000 + Math.random() * 14000);

    const screamTimer = setInterval(() => {
      if (Math.random() < 0.5) scream.play();
    }, 45000 + Math.random() * 35000);

    const wolfTimer = setInterval(() => {
      if (Math.random() < 0.45) wolfHowl.play();
    }, 120000 + Math.random() * 120000);

    return () => {
      clearInterval(whisperTimer);
      clearInterval(screamTimer);
      clearInterval(wolfTimer);
      window.removeEventListener("ghost-answered", onAnswer);
      stopHum();
      soundsRef.current.forEach((s) => s.unload());
      soundsRef.current = [];
    };
  }, [started, integrity]);

  useEffect(() => {
    // ambient presence rises as integrity falls
    const boost = integrity < 50 ? 1.4 : integrity < 70 ? 1.2 : 1;
    soundsRef.current.forEach((s) => {
      if (muted) s.volume(0);
      else s.volume((s === soundsRef.current[0] ? 0.25 : s === soundsRef.current[1] ? 0.3 : s === soundsRef.current[2] ? 0.5 : 0.4) * boost);
    });
  }, [muted, integrity]);

  useEffect(() => {
    const enable = () => setStarted(true);
    window.addEventListener("click", enable, { once: true });
    window.addEventListener("keydown", enable, { once: true });
    return () => {
      window.removeEventListener("click", enable);
      window.removeEventListener("keydown", enable);
    };
  }, []);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setMuted((m) => !m);
        setStarted(true);
      }}
      className="flex items-center gap-1.5 rounded-full border border-[rgba(74,222,128,0.2)] px-3 py-1.5 font-mono text-[10px] text-[rgba(74,222,128,0.6)] transition hover:border-blood/50 hover:text-blood-bright"
      aria-label={muted ? "unmute sound" : "mute sound"}
      title={muted ? "unmute" : "mute"}
    >
      {muted ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5 6 9H2v6h4l5 4V5zM22 9l-6 6M16 9l6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {muted ? "muted" : "sound"}
    </button>
  );
}
