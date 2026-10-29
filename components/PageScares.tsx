"use client";

import { useEffect, useState } from "react";
import { Howl } from "howler";

/**
 * Page-level interactive scares:
 *  - LEAVE ATTEMPT: when the user tries to close/leave, a red flash +
 *    whisper fires (the ghost doesn't want you to go).
 *  - IDLE CORRUPTION: after 25s of no interaction, the page glitches
 *    briefly (a full-screen jolt + flicker). If you keep idling, it
 *    happens again, closer together.
 */

export default function PageScares() {
  const [leaving, setLeaving] = useState(false);
  const [idleGlitch, setIdleGlitch] = useState(0);

  // leave attempt
  useEffect(() => {
    const onLeave = () => {
      setLeaving(true);
      try {
        const w = new Howl({ src: ["/sfx/whisper.mp3"], volume: 0.6 });
        w.play();
        setTimeout(() => w.unload(), 3000);
      } catch { /* ignore */ }
      setTimeout(() => setLeaving(false), 1200);
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, []);

  // idle corruption — 25s idle, then glitch; repeat with shrinking gaps
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    let cancelled = false;
    let idleGap = 25000;
    const arm = () => {
      t = setTimeout(() => {
        if (cancelled) return;
        setIdleGlitch((g) => g + 1);
        idleGap = Math.max(8000, idleGap - 5000);
        arm();
      }, idleGap);
    };
    const reset = () => {
      clearTimeout(t);
      idleGap = 25000;
      arm();
    };
    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset));
    arm();
    return () => {
      cancelled = true;
      clearTimeout(t);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, []);

  return (
    <>
      {/* leave flash */}
      {leaving && (
        <div className="pointer-events-none fixed inset-0 z-[95] leave-flash" />
      )}

      {/* idle glitch */}
      {idleGlitch > 0 && (
        <div key={idleGlitch} className="pointer-events-none fixed inset-0 z-[95] idle-glitch" />
      )}
    </>
  );
}
