"use client";

import { useEffect, useState } from "react";

/**
 * CRT layer — scanlines, grain, flicker, full-screen glitch bursts,
 * heartbeat, and integrity-driven escalation:
 *  - below 60%: glitches more frequent and intense
 *  - below 35%: brief red-word flashes (LISTENING / STILL HERE / YOU)
 *  - vignette darkens as integrity drops
 */

const RED_WORDS = ["LISTENING", "STILL HERE", "YOU", "IT SEES YOU"];

export default function CRTEffects({ agitated = false }: { agitated?: boolean }) {
  const [glitch, setGlitch] = useState(0);
  const [strength, setStrength] = useState(0);
  const [integrity, setIntegrity] = useState(100);
  const [redWord, setRedWord] = useState<string | null>(null);

  // integrity from ArchiveIntegrity
  useEffect(() => {
    const onIntegrity = (e: Event) => {
      const detail = (e as CustomEvent).detail as { integrity?: number } | undefined;
      if (detail?.integrity !== undefined) setIntegrity(detail.integrity);
    };
    window.addEventListener("archive-integrity", onIntegrity);
    return () => window.removeEventListener("archive-integrity", onIntegrity);
  }, []);

  // random full-screen glitches — frequency scales with escalation
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const loop = () => {
      const base = agitated ? 4000 : 9000;
      const lowIntegrity = integrity < 60 ? 3000 : 0;
      const gap = Math.max(2500, base - lowIntegrity + Math.random() * 6000);
      t = setTimeout(() => {
        if (!cancelled) {
          setGlitch((g) => g + 1);
          loop();
        }
      }, gap);
    };
    loop();
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [agitated, integrity]);

  // red-word flashes below 35% integrity
  useEffect(() => {
    if (integrity >= 35) return;
    let t: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const loop = () => {
      t = setTimeout(() => {
        if (cancelled) return;
        setRedWord(RED_WORDS[Math.floor(Math.random() * RED_WORDS.length)]);
        setTimeout(() => setRedWord(null), 280);
        loop();
      }, 6000 + Math.random() * 9000);
    };
    loop();
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [integrity]);

  // heartbeat strengthens over time
  useEffect(() => {
    const iv = setInterval(() => {
      setStrength((s) => Math.min(s + 0.15, 1));
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  // vignette opacity — darkens as integrity drops
  const vignetteOpacity = 0.45 + (100 - integrity) / 100 * 0.4;

  return (
    <>
      <div className="grain" />

      <div
        className={`heartbeat-layer ${agitated || integrity < 50 ? "heartbeat-agitated" : ""}`}
        style={{ opacity: 0.4 + strength * 0.6 }}
      />

      {/* vignette — darkens with integrity loss */}
      <div
        className="pointer-events-none fixed inset-0 z-[81]"
        style={{
          background: `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,${vignetteOpacity}) 100%)`,
          transition: "background 2s ease",
        }}
      />

      {glitch > 0 && (
        <div key={glitch} className="full-glitch fixed inset-0 z-[82] pointer-events-none" />
      )}

      {redWord && (
        <div className="pointer-events-none fixed inset-0 z-[83] flex items-center justify-center">
          <span className="bloom-red font-mono text-6xl font-bold tracking-[0.3em] text-blood-bright sm:text-8xl">
            {redWord}
          </span>
        </div>
      )}
    </>
  );
}
