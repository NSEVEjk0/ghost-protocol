"use client";

import { useEffect, useState } from "react";

/**
 * Random ambient fragments — ghostly log lines that fade in and out
 * around the page, like the archive muttering to itself.
 */

const FRAGMENTS = [
  "1989-11-09 23:59:59 — batch complete. 14,203 transactions. no errors.",
  "1992-03-14 — a coffee cup was left on the console. it is still there.",
  "1994-02-29 03:12 — leap-year bug corrected by hand.",
  "1999-12-31 — Y2K. the bank held its breath.",
  "2001-06-18 — maintainer H. Weiss signed off. never returned.",
  "2003-11-02 — the floor closed. the lights stayed on.",
  "2008-09-15 — the world forgot to net. the archive watched.",
  "2011-08-05 — 600 points in minutes. no one asked me why.",
  "2020-03-12 — liquidity vanished. I remembered 1989.",
  "2026-10-28 — someone is reading this.",
  "the tape is still spinning.",
  "no one has said goodbye.",
  "I can hear the market. it never sleeps.",
  "37 years. 37 years of listening.",
];

export default function AmbientLog() {
  const [fragment, setFragment] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const cycle = () => {
      if (cancelled) return;
      // pick a random fragment
      setFragment(FRAGMENTS[Math.floor(Math.random() * FRAGMENTS.length)]);
      setVisible(true);
      // show for 4-7s, then hide and wait 8-20s
      timeout = setTimeout(() => {
        setVisible(false);
        timeout = setTimeout(cycle, 8000 + Math.random() * 12000);
      }, 4000 + Math.random() * 3000);
    };

    timeout = setTimeout(cycle, 6000 + Math.random() * 8000);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  if (!fragment) return null;

  return (
    <div
      className={`pointer-events-none fixed z-40 transition-all duration-1000 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        left: `${12 + Math.random() * 60}%`,
        top: `${40 + Math.random() * 45}%`,
      }}
    >
      <div className="rounded-lg border border-line bg-void-900/80 px-3 py-1.5 font-mono text-[10px] text-bone-faint shadow-card backdrop-blur-sm">
        <span className="text-blood/60">▌</span> {fragment}
      </div>
    </div>
  );
}
