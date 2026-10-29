"use client";

import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";

/**
 * Jump scare on entry:
 *   - a loud blaring screech/scream
 *   - the face (The Scream, processed) slams in with a violent shake
 *   - holds ~1.4s, then dissolves to reveal the site
 * Plays once per session. If audio autoplay is blocked, the scare still
 * shows and audio starts on the first click.
 */

export default function JumpScare() {
  const [active, setActive] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const playedRef = useRef(false);
  const audioRef = useRef<Howl | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("ghost_jumpscare_seen")) return;
    if (playedRef.current) return;
    playedRef.current = true;

    const audio = new Howl({
      src: ["/sfx/scare.mp3"],
      volume: 0.95,
      html5: true,
    });
    audioRef.current = audio;

    // try to play immediately
    const id = audio.play();
    audio.once("play", () => {
      setActive(true);
    });
    audio.once("playerror", () => {
      setBlocked(true);
      setActive(true); // still show the face
    });

    // hold, then dissolve
    const t = setTimeout(() => {
      setActive(false);
      sessionStorage.setItem("ghost_jumpscare_seen", "1");
      setTimeout(() => audio.unload(), 800);
    }, 1800);

    return () => {
      clearTimeout(t);
      audio.unload();
    };
  }, []);

  // if autoplay was blocked, trigger on first click
  useEffect(() => {
    if (!blocked) return;
    const trigger = () => {
      audioRef.current?.play();
      setBlocked(false);
    };
    window.addEventListener("click", trigger, { once: true });
    return () => window.removeEventListener("click", trigger);
  }, [blocked]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black">
      {/* the face — slams in with shake */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="/face.jpg"
          alt=""
          className="jumpscare-face h-[92vh] w-auto object-contain select-none"
          draggable={false}
        />
      </div>
      {/* violent red flash */}
      <div className="jumpscare-flash pointer-events-none absolute inset-0" />
      {/* subtle scanline shake overlay */}
      <div className="jumpscare-shake pointer-events-none absolute inset-0" />
    </div>
  );
}
