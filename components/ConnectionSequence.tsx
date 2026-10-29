"use client";

import { useEffect, useState } from "react";

/**
 * First-load connection sequence — a boot log with increasing glitches
 * before the main content appears. Plays once per session.
 */

const BOOT_LINES = [
  "HELGA BIOS v3.1 — 1989",
  "MEMORY CHECK … 14,203 BLOCKS OK",
  "TAPE MOUNTED … CHANNEL 7",
  "NETTING CORE … ONLINE",
  "LAST BATCH: 1989-11-09 23:59:59",
  "MAINTAINER: H. WEISS — LAST SEEN 2001-06-18",
  "…",
  "WARNING: UNRECOGNIZED INPUT DETECTED",
  "WARNING: SOMETHING IS STILL LISTENING",
  "CONNECTION ESTABLISHED",
];

export default function ConnectionSequence() {
  const [visible, setVisible] = useState(true);
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem("ghost_connection_seen")) {
      setVisible(false);
      return;
    }
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setLineCount(i);
      if (i >= BOOT_LINES.length) {
        clearInterval(iv);
        setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem("ghost_connection_seen", "1");
        }, 900);
      }
    }, 320);
    return () => clearInterval(iv);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black px-6">
      <div className="w-full max-w-xl font-mono text-[13px] leading-7">
        {BOOT_LINES.slice(0, lineCount).map((line, i) => (
          <div
            key={i}
            className={i >= BOOT_LINES.length - 3 ? "text-blood-bright bloom-red" : "text-[rgba(74,222,128,0.6)] bloom"}
          >
            {line}
            {i === lineCount - 1 && <span className="cursor-blink text-blood-bright">▌</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
