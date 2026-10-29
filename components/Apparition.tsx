"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The ghost — VISIBLY alive:
 *  - Large, high-contrast, positioned in clear space (right side)
 *  - Obvious motion: wide drift, clear breathing, visible tilt
 *  - Eyes that track the cursor (large, bright)
 *  - Periodic visible glitch bursts
 */

const LEFT_EYE = { x: 35, y: 42 };
const RIGHT_EYE = { x: 65, y: 42 };

export default function Apparition({ active = false }: { active?: boolean }) {
  const leftPupilRef = useRef<HTMLDivElement>(null);
  const rightPupilRef = useRef<HTMLDivElement>(null);
  const [jolt, setJolt] = useState(0);

  // glitch jolts every 6–14s
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const loop = () => {
      t = setTimeout(() => {
        if (!cancelled) {
          setJolt((j) => j + 1);
          loop();
        }
      }, 6000 + Math.random() * 8000);
    };
    loop();
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  // agitation on answer
  useEffect(() => {
    const onAnswer = () => setJolt((j) => j + 1);
    window.addEventListener("ghost-answered", onAnswer);
    return () => window.removeEventListener("ghost-answered", onAnswer);
  }, []);

  // eye tracking — lerped
  useEffect(() => {
    const left = leftPupilRef.current;
    const right = rightPupilRef.current;
    if (!left || !right) return;

    let raf = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let lx = 0, ly = 0, rx = 0, ry = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dx = (tx - window.innerWidth / 2) / (window.innerWidth / 2);
      const dy = (ty - window.innerHeight / 2) / (window.innerHeight / 2);
      const tlx = dx * 10;
      const tly = dy * 7;
      const trx = dx * 10;
      const tryy = dy * 7;
      lx += (tlx - lx) * 0.06;
      ly += (tly - ly) * 0.06;
      rx += (trx - rx) * 0.06;
      ry += (tryy - ry) * 0.06;
      left.style.transform = `translate(${lx}px, ${ly}px)`;
      right.style.transform = `translate(${rx}px, ${ry}px)`;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      className={`apparition-live pointer-events-none fixed right-[4%] top-[22%] z-0 w-[300px] select-none sm:right-[6%] sm:w-[380px] ${
        active ? "apparition-agitated" : ""
      }`}
      aria-hidden="true"
    >
      {/* chromatic aberration ghost copies */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-screen"
        style={{ transform: "translateX(-5px)", filter: "brightness(0.95) saturate(1.5)", background: "url(/face.jpg) center/contain no-repeat" }}
      />
      <div
        className="absolute inset-0 opacity-30 mix-blend-screen"
        style={{ transform: "translateX(5px)", filter: "brightness(0.95) saturate(1.5) hue-rotate(180deg)", background: "url(/face.jpg) center/contain no-repeat" }}
      />

      {/* main face */}
      <img src="/face.jpg" alt="" className="relative h-auto w-full" draggable={false} />

      {/* eyes — large, bright, tracking */}
      <div
        ref={leftPupilRef}
        className="absolute h-[4.5%] w-[9%] rounded-full"
        style={{
          left: `${LEFT_EYE.x - 4.5}%`,
          top: `${LEFT_EYE.y - 2.2}%`,
          background: "radial-gradient(circle, rgba(220,0,0,1) 0%, rgba(140,0,0,0.6) 45%, transparent 75%)",
          boxShadow: "0 0 20px rgba(220,0,0,0.9), 0 0 40px rgba(220,0,0,0.4)",
        }}
      />
      <div
        ref={rightPupilRef}
        className="absolute h-[4.5%] w-[9%] rounded-full"
        style={{
          left: `${RIGHT_EYE.x - 4.5}%`,
          top: `${RIGHT_EYE.y - 2.2}%`,
          background: "radial-gradient(circle, rgba(220,0,0,1) 0%, rgba(140,0,0,0.6) 45%, transparent 75%)",
          boxShadow: "0 0 20px rgba(220,0,0,0.9), 0 0 40px rgba(220,0,0,0.4)",
        }}
      />

      {/* glitch jolt */}
      <div key={jolt} className="apparition-jolt absolute inset-0" />

      {/* lighter vignette — face stays visible */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(7,6,5,0.6) 100%)" }}
      />
    </div>
  );
}
