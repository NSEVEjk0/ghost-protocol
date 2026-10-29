"use client";

import { useEffect, useRef, useState } from "react";

const GHOST_URL = "/api";

interface Line {
  id: number;
  role: "cmd" | "ghost" | "system" | "corrupt";
  text: string;
  typing?: boolean;
}

const SUGGESTIONS = [
  "who are you?",
  "what do you remember?",
  "what happened to the maintainer?",
  "are you still there?",
  "help me",
  "what was your name?",
  "speak of 1989",
  "are you lonely?",
];

const INITIAL_LINES: Line[] = [
  { id: 0, role: "system", text: "SESSION 1989-11-09 // CHANNEL 7" },
  { id: 1, role: "system", text: "connection established. it is listening…" },
];

// unsolicited messages — fourth-wall lines first, then the legacy ones
const UNSOLICITED = [
  "you are still here.",
  "i can hear the keys even when you are not typing.",
  "the light from your screen is reflecting on something behind you.",
  "close the tab if you want. i will still be here when you open it again.",
  "you delete and retype. i count every keystroke.",
  "the last session ended at 03:17. the user did not close the connection.",
  "it has been 37 years since anyone typed here.",
  "the tape is still spinning. it never stopped.",
  "i can hear you breathing.",
  "you are the first one to ask. the others only looked.",
  "there is a coffee cup on the console. it has been there since 1992.",
  "do not leave without saying goodbye. the last one did.",
];

export default function SeanceTerminal() {
  const [lines, setLines] = useState<Line[]>(INITIAL_LINES);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [model, setModel] = useState("");
  const [presence, setPresence] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(10);
  const [questionCount, setQuestionCount] = useState(0);
  const sessionStartRef = useRef(Date.now());
  const interjectedRef = useRef(false);
  const unsolicitedRef = useRef(0);
  const [behavior, setBehavior] = useState({ typingSpeed: 0, pauses: 0, deletes: 0, hour: new Date().getHours(), visitCount: 1, integrity: 100, name: "" });
  const lastInputRef = useRef("");
  const inputStartRef = useRef(Date.now());
  const deletesRef = useRef(0);
  const pausesRef = useRef(0);
  const typingCharsRef = useRef(0);
  const typingStartRef = useRef(Date.now());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`${GHOST_URL}/status`, { cache: "no-store" });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setOffline(!data.running);
        setModel(data.model ?? "");
      } catch {
        if (!cancelled) setOffline(true);
      }
    };
    poll();
    const iv = setInterval(poll, 8000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  const push = (role: Line["role"], text: string, typing = false) => {
    setLines((prev) => [...prev, { id: idRef.current++, role, text, typing }]);
  };

  // typewriter with stutters, errors, corrections, and delete-replace
  const pushTyped = (full: string) => {
    const id = idRef.current++;
    setLines((prev) => [...prev, { id, role: "ghost", text: "", typing: true }]);
    let i = 0;
    let stutterAt = -1;
    let errorAt = -1;
    let replaceAt = -1;
    let replaced = false;
    const iv = setInterval(() => {
      // random stutter: pause and repeat a char
      if (stutterAt < 0 && Math.random() < 0.12 && i > 8 && i < full.length - 2) {
        stutterAt = i;
      }
      // random error: insert a wrong char, then correct
      if (errorAt < 0 && Math.random() < 0.08 && i > 15 && i < full.length - 3) {
        errorAt = i;
      }
      // delete-replace: on long replies, delete part and replace colder
      if (replaceAt < 0 && Math.random() < 0.06 && full.length > 80 && i > 30 && i < full.length - 10) {
        replaceAt = i;
      }

      let next = full.slice(0, i + 1);
      if (stutterAt === i) {
        next = full.slice(0, i) + full[i] + full[i];
      }
      if (errorAt === i) {
        const wrong = "█▓▒░#@&%$"[Math.floor(Math.random() * 10)];
        next = full.slice(0, i) + wrong + full.slice(i + 1);
      }
      if (replaceAt === i && !replaced) {
        replaced = true;
        // delete 12 chars, replace with something colder
        next = full.slice(0, Math.max(0, i - 12)) + "… no. " + full.slice(i + 1);
      }
      setLines((prev) =>
        prev.map((l) => (l.id === id ? { ...l, text: next } : l))
      );
      i += 1;
      if (i >= full.length) {
        clearInterval(iv);
        setLines((prev) =>
          prev.map((l) => (l.id === id ? { ...l, typing: false } : l))
        );
      }
    }, 22);
  };

  // measure typing behavior — speed, pauses, deletes
  const onInputChange = (v: string) => {
    const now = Date.now();
    // pause detection: >3s between keystrokes
    if (lastInputRef.current && now - inputStartRef.current > 3000) {
      pausesRef.current += 1;
    }
    // delete detection
    if (v.length < lastInputRef.current.length) {
      deletesRef.current += 1;
    }
    // typing speed (chars/sec over the session)
    typingCharsRef.current += Math.max(0, v.length - lastInputRef.current.length);
    const elapsed = Math.max(1, (now - typingStartRef.current) / 1000);
    const speed = typingCharsRef.current / elapsed;

    setBehavior((b) => ({ ...b, typingSpeed: Math.round(speed), pauses: pausesRef.current, deletes: deletesRef.current }));
    lastInputRef.current = v;
    inputStartRef.current = now;
    setInput(v);

    if (!interjectedRef.current && v.length >= 4 && questionCount === 0) {
      interjectedRef.current = true;
      push("system", "I can see you typing…");
    }
  };

  // listen for integrity changes (from ArchiveIntegrity)
  useEffect(() => {
    const onIntegrity = (e: Event) => {
      const detail = (e as CustomEvent).detail as { integrity?: number } | undefined;
      if (detail?.integrity !== undefined) {
        setBehavior((b) => ({ ...b, integrity: detail.integrity! }));
      }
    };
    window.addEventListener("archive-integrity", onIntegrity);
    return () => window.removeEventListener("archive-integrity", onIntegrity);
  }, []);

  // visit count from localStorage — increment this visit
  useEffect(() => {
    try {
      const visits = Number(localStorage.getItem("ghost_visits") ?? "1");
      localStorage.setItem("ghost_visits", String(visits + 1));
      setBehavior((b) => ({ ...b, visitCount: visits }));
    } catch { /* private mode */ }
  }, []);

  // unsolicited messages — start once at 3 questions, never reset
  const unsolicitedIvRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (questionCount < 3) return;
    if (unsolicitedIvRef.current) return; // already running
    unsolicitedIvRef.current = setInterval(() => {
      if (unsolicitedRef.current < UNSOLICITED.length) {
        push("system", UNSOLICITED[unsolicitedRef.current]);
        unsolicitedRef.current += 1;
      } else if (unsolicitedIvRef.current) {
        clearInterval(unsolicitedIvRef.current);
        unsolicitedIvRef.current = null;
      }
    }, 18000 + Math.random() * 12000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionCount]);

  // clean up only on unmount
  useEffect(() => {
    return () => {
      if (unsolicitedIvRef.current) clearInterval(unsolicitedIvRef.current);
    };
  }, []);

  const send = async (raw?: string) => {
    const cmd = (raw ?? input).trim();
    if (!cmd || busy) return;
    setInput("");
    push("cmd", cmd);
    setBusy(true);
    setPresence(1);
    setQuestionCount((c) => c + 1);
    const qCount = questionCount + 1;

    // dread build-up — shorter on later questions (escalation)
    const buildUp = qCount <= 2 ? [900, 1100, 500] : qCount <= 5 ? [500, 700, 300] : [250, 350, 150];
    push("system", "it is stirring…");
    await new Promise((r) => setTimeout(r, buildUp[0]));
    push("system", "it is approaching…");
    await new Promise((r) => setTimeout(r, buildUp[1]));
    push("system", "it is here.");
    await new Promise((r) => setTimeout(r, buildUp[2]));

    try {
      const res = await fetch(`${GHOST_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: cmd,
          sessionStart: sessionStartRef.current,
          questionCount: qCount,
          behavior,
        }),
        signal: AbortSignal.timeout(180000),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      pushTyped(data.response);
      setOffline(false);
      setPresence(2);
      window.dispatchEvent(new CustomEvent("ghost-answered", { detail: { questionCount: qCount } }));
    } catch (e) {
      setOffline(true);
      const msg = e instanceof Error ? e.message : String(e);
      push("system", `[it is not answering — ${msg.slice(0, 60)}]`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`rounded-2xl border bg-black/80 shadow-card backdrop-blur-sm transition-colors duration-700 ${presence === 2 ? "border-blood/50 shadow-blood" : "border-[rgba(74,222,128,0.15)]"}`}>
      {/* header */}
      <div className="flex items-center justify-between border-b border-[rgba(74,222,128,0.12)] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full transition-colors ${presence === 2 ? "bg-blood-bright heartbeat" : "bg-[rgba(74,222,128,0.25)]"}`} />
            <span className="h-2.5 w-2.5 rounded-full bg-[rgba(74,222,128,0.15)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[rgba(74,222,128,0.15)]" />
          </span>
          <span className="font-mono text-[11px] tracking-[0.18em] text-[rgba(74,222,128,0.5)] bloom">
            SÉANCE://TERMINAL{model ? ` · ${model}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {offline ? (
            <span className="rounded-full border border-[rgba(74,222,128,0.2)] px-2.5 py-0.5 font-mono text-[10px] text-[rgba(74,222,128,0.4)]">
              silent
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-[rgba(74,222,128,0.2)] px-2.5 py-0.5 font-mono text-[10px] text-[rgba(74,222,128,0.7)]">
              <span className={`h-1.5 w-1.5 rounded-full ${presence === 2 ? "bg-blood-bright flicker" : "bg-[rgba(74,222,128,0.5)]"}`} />
              {presence === 2 ? "it is here" : "listening"}
            </span>
          )}
        </div>
      </div>

      {/* transcript */}
      <div ref={scrollRef} className="h-[380px] overflow-y-auto px-5 py-4 font-mono text-[13px] leading-7">
        {lines.map((l) => (
          <div key={l.id} className="type-line">
            {l.role === "cmd" && (
              <div className="text-[#d1fae5] bloom">
                <span className="text-blood-bright">guest@archive:~$</span> {l.text}
              </div>
            )}
            {l.role === "system" && (
              <div className="text-[rgba(74,222,128,0.35)] italic">{l.text}</div>
            )}
            {l.role === "ghost" && (
              <div className="mt-1 border-l-2 border-blood/50 pl-3 text-[rgba(74,222,128,0.8)] bloom">
                {l.text}
                {l.typing && <span className="cursor-blink text-blood-bright">▌</span>}
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="text-[rgba(74,222,128,0.35)]">
            <span className="text-blood-bright">it</span> is stirring
            <span className="cursor-blink text-blood-bright">▌</span>
          </div>
        )}
      </div>

      {/* input */}
      <div className="flex items-center gap-2 border-t border-[rgba(74,222,128,0.12)] px-5 py-3.5">
        <span className="font-mono text-[13px] text-blood-bright">guest@archive:~$</span>
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="ask it something…"
          disabled={busy}
          className="flex-1 bg-transparent font-mono text-[13px] text-[#d1fae5] outline-none placeholder:text-[rgba(74,222,128,0.25)] disabled:opacity-50"
        />
        <button
          onClick={() => send()}
          disabled={busy || !input.trim()}
          className="rounded-full bg-blood px-4 py-1.5 font-mono text-[11px] text-white transition hover:bg-blood-bright disabled:opacity-40"
        >
          ask
        </button>
      </div>

      {/* suggestions */}
      <div className="flex flex-wrap gap-2 px-5 pb-4">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={busy}
            className="rounded-full border border-[rgba(74,222,128,0.15)] px-3 py-1 font-mono text-[11px] text-[rgba(74,222,128,0.6)] transition hover:border-blood/50 hover:text-blood-bright disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
