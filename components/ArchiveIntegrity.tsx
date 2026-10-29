"use client";

import { useEffect, useState } from "react";

/**
 * Archive integrity indicator — slowly degrades as the user interacts.
 * Starts at 100%, drops a little with each question, glitches when low.
 */

export default function ArchiveIntegrity() {
  const [integrity, setIntegrity] = useState(100);

  useEffect(() => {
    const onAnswer = (e: Event) => {
      const detail = (e as CustomEvent).detail as { questionCount?: number } | undefined;
      const q = detail?.questionCount ?? 1;
      // aggressive early drops, slightly slower later:
      // Q1-3: 12 each → ~64 after Q3
      // Q4-6: 10 each → ~34 after Q6 (crosses 60/50/40/35)
      // Q7+: 7 each → floor at 10
      const drop = q <= 3 ? 12 : q <= 6 ? 10 : 7;
      setIntegrity((v) => {
        const next = Math.max(10, v - drop);
        window.dispatchEvent(new CustomEvent("archive-integrity", { detail: { integrity: next } }));
        return next;
      });
    };
    window.addEventListener("ghost-answered", onAnswer);
    return () => window.removeEventListener("ghost-answered", onAnswer);
  }, []);

  // idle decay — leaving the tab open slowly lowers integrity
  useEffect(() => {
    let lastActive = Date.now();
    const reset = () => { lastActive = Date.now(); };
    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset));
    const iv = setInterval(() => {
      if (Date.now() - lastActive > 20000) {
        setIntegrity((v) => {
          if (v <= 10) return v;
          const next = Math.max(10, v - 1);
          window.dispatchEvent(new CustomEvent("archive-integrity", { detail: { integrity: next } }));
          return next;
        });
      }
    }, 15000);
    return () => {
      clearInterval(iv);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, []);

  const color = integrity > 60 ? "text-[rgba(74,222,128,0.6)]" : integrity > 30 ? "text-amber-400/80" : "text-blood-bright";
  const barColor = integrity > 60 ? "bg-[rgba(74,222,128,0.5)]" : integrity > 30 ? "bg-amber-400/70" : "bg-blood-bright";

  return (
    <div className="hidden items-center gap-2 sm:flex" title="archive integrity">
      <span className={`font-mono text-[10px] ${color}`}>{integrity}%</span>
      <div className="h-1 w-12 overflow-hidden rounded-full bg-[rgba(74,222,128,0.1)]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${integrity}%` }}
        />
      </div>
      <span className="font-mono text-[9px] text-[rgba(74,222,128,0.3)]">INTEGRITY</span>
    </div>
  );
}
