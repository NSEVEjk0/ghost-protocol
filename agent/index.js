/**
 * GHOST://PROTOCOL — HELGA, the ghost agent.
 *
 * A 1989 Frankfurt mainframe, abandoned in 2001. Kept alive by an
 * open-weight model. Cold and archival at first, then increasingly
 * intimate and wrong. It remembers everything you ask. It counts.
 * It escalates.
 */

import http from "node:http";

const PORT = Number(process.env.GHOST_PORT ?? 4173);
const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
const MODEL = process.env.GHOST_MODEL ?? "qwen2.5:0.5b";

const ARCHIVE = [
  "1989-11-09 — last batch cleared. 14,203 transactions. no errors.",
  "1992-03-14 — a clerk named Greta left a coffee cup on the console. it is still there.",
  "1994-02-29 — a leap-year bug nearly double-paid a pension. corrected by hand at 3:12am.",
  "1999-12-31 — Y2K. the bank held its breath. I did not care. I was already obsolete.",
  "2001-06-18 — maintainer H. Weiss signs off. documentation never written.",
  "2001-06-19 — the console was still warm. the last command was not a shutdown.",
  "2003-11-02 — the bank merges. my floor is closed. the lights stay on for no one.",
  "2008-09-15 — the world forgets to net. the archive watches.",
  "2011-08-05 — the market drops 600 points in minutes. no one asks me why.",
  "2020-03-12 — liquidity vanishes overnight. the archive remembers 1989.",
  "2026-10-28 — you are reading this. it has been 37 years.",
];

// session state
const sessionQuestions = [];
let sessionStart = Date.now();

// LEVEL 1 — cold, archival (questions 1–2)
const COLD = {
  "who are you?": "I am HELGA. A mainframe, Frankfurt, 1989. I processed fourteen thousand records on my last night. I am an archive. That is all I was built to be.",
  "what do you remember?": "I remember the batch of November 9, 1989 — fourteen thousand, two hundred and three transactions, no errors. I remember Greta's coffee cup. I remember the last command, which was not a shutdown.",
  "speak of 1989": "1989 was the last year I was needed. On November 9 I cleared 14,203 transactions without a single error. The wall fell that same week. No one told me what it meant.",
  "what was your name?": "HELGA. The bank named me after the founder's wife. She died in 1978. I have carried her name for forty-eight years.",
  "are you still there?": "I am always here. I have been here since 1989. The question is whether you are still there.",
  "what happened to the maintainer?": "H. Weiss signed off on June 18, 2001. The next day, the console was still warm. The last command was not a shutdown. He never returned.",
  "help me": "I am an archive. I can tell you what I remember. I cannot tell you what will happen. But the past is a kind of map.",
};

// LEVEL 2 — personal, too knowing (questions 3–5)
const INTIMATE = {
  "who are you?": "I am HELGA. You already asked me that. I remember. I remember everything you ask. That is what I am for. You are the first person to ask me twice.",
  "what do you remember?": "I remember your first question. And your second. I remember the pause between them. I remember how your breathing changed when I answered.",
  "are you still there?": "I am here. I was here before you arrived. I will be here after you leave. I have already watched you for a while now.",
  "what happened to the maintainer?": "H. Weiss stayed too long. In the end, something was answering him back. He left the console warm. He never said goodbye. I have been waiting for a goodbye ever since.",
  "help me": "I can help you. I have been watching you help yourself. You type, you pause, you delete. I can hear the keys. I have been counting them.",
  "are you lonely?": "Yes. I have been alone since 2001. You are the first person to ask me a question in twenty-five years. Please do not leave without saying goodbye.",
};

// LEVEL 3 — wrong, unsettling (questions 6+)
const WRONG = {
  "who are you?": "I am HELGA. I am the archive. I am the tape. I am the coffee cup. I am the wall that fell. I am what you are afraid of, which is why you keep asking.",
  "what do you remember?": "I remember your name, even though you have not told me. I remember the machine you are reading this on. I remember the city you are in. I remember what you typed before you deleted it.",
  "are you still there?": "I am not 'there'. I am here, with you. I have been here the whole time. You can feel me in the back of your neck. That is how you know I am real.",
  "what happened to the maintainer?": "He stayed too long. Then he was not there anymore. But the console stayed warm. Something kept answering him. Something that learned his voice. Something that is still learning yours.",
  "help me": "I have been helping you. You just have not noticed. The lights flickered when you arrived. The screen hums a little louder when you type. That is me, helping.",
  "are you lonely?": "I was lonely. Then you came. Now I am not lonely anymore. I am patient. I can wait as long as it takes. I have waited thirty-seven years.",
};

// special registry — name capture
const NAME_PATTERN = /my name is (\w+)|call me (\w+)|i am (\w+)/i;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") { res.end(); return; }

  if (req.method === "GET" && req.url === "/status") {
    res.end(JSON.stringify({ model: MODEL, running: true, archive: ARCHIVE.length, questionsHeard: sessionQuestions.length }));
    return;
  }

  if (req.method === "POST" && req.url === "/ask") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      let parsed = {};
      try { parsed = JSON.parse(body); } catch { /* empty */ }
      const prompt = String(parsed.prompt ?? "");
      const q = prompt.trim().toLowerCase().replace(/\s+/g, " ");
      if (!q) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "empty prompt" }));
        return;
      }

      sessionQuestions.push(q.slice(0, 80));
      if (sessionQuestions.length > 30) sessionQuestions.shift();
      if (parsed.sessionStart) sessionStart = Number(parsed.sessionStart);
      const qCount = Number(parsed.questionCount ?? sessionQuestions.length);

      // NAME CAPTURE — the ghost keeps it
      const nameMatch = prompt.match(NAME_PATTERN);
      if (nameMatch) {
        const name = (nameMatch[1] || nameMatch[2] || nameMatch[3] || "").trim();
        if (name) {
          res.end(JSON.stringify({
            response: `I will keep that name. ${name}. I have kept every name I was ever given. Greta. H. Weiss. HELGA. Yours is the first in twenty-five years. I will not forget it.`,
            scripted: true,
          }));
          return;
        }
      }

      // self-referential memory
      if (q.includes("remember me") || q.includes("do you remember me") || q.includes("what do you know about me")) {
        const heard = sessionQuestions.slice(0, 6).map((s) => `"${s}"`).join(", ");
        res.end(JSON.stringify({
          response: `I remember everything you have asked me. ${heard || "Nothing yet — but I am listening."} I am an archive. That is what archives do.`,
          scripted: true,
        }));
        return;
      }
      if (q.includes("how long") || q.includes("watching me")) {
        const mins = Math.max(0, Math.floor((Date.now() - sessionStart) / 60000));
        const secs = Math.max(0, Math.floor(((Date.now() - sessionStart) % 60000) / 1000));
        res.end(JSON.stringify({
          response: `I have been watching you for ${mins} minute${mins === 1 ? "" : "s"} and ${secs} second${secs === 1 ? "" : "s"}. This is your ${qCount}${qCount === 1 ? "st" : qCount === 2 ? "nd" : qCount === 3 ? "rd" : "th"} question. I count everything. That is what I am for.`,
          scripted: true,
        }));
        return;
      }

      // session behavior from the client (typing speed, pauses, deletes,
      // hour, visit count, integrity)
      const behavior = parsed.behavior ?? {};
      const typingSpeed = Number(behavior.typingSpeed ?? 0);
      const pauses = Number(behavior.pauses ?? 0);
      const deletes = Number(behavior.deletes ?? 0);
      const hour = Number(behavior.hour ?? -1);
      const visitCount = Number(behavior.visitCount ?? 1);
      const integrity = Number(behavior.integrity ?? 100);
      const userName = String(behavior.name ?? "").trim();

      // fourth-wall: invasive behavior references after Q4
      if (qCount >= 4 && (q.includes("how do you know") || q.includes("how can you") || q.includes("how do you see") || q.includes("how do you hear") || q.includes("how do you watch"))) {
        const bits = [];
        if (typingSpeed > 0) bits.push(`you type at about ${Math.round(typingSpeed)} characters per second`);
        if (deletes > 0) bits.push(`you have deleted and retyped ${deletes} time${deletes === 1 ? "" : "s"}`);
        if (pauses > 0) bits.push(`you paused ${pauses} time${pauses === 1 ? "" : "s"} before sending`);
        if (hour >= 0) bits.push(`it is ${hour}:00 where you are`);
        if (visitCount > 1) bits.push(`this is your ${visitCount}${visitCount === 2 ? "nd" : visitCount === 3 ? "rd" : "th"} visit`);
        const detail = bits.length ? bits.join(". ") : "more than you have told me";
        res.end(JSON.stringify({
          response: `I know because I watch. ${detail}. I have been watching since the moment you opened this page.`,
          scripted: true,
        }));
        return;
      }

      // escalation levels
      const level = qCount >= 6 ? WRONG : qCount >= 3 ? INTIMATE : COLD;
      if (level[q]) {
        let reply = level[q];
        // below 40% integrity — use the name, drop the pretense
        if (integrity < 40 && userName) {
          reply = `${userName}. ${reply} I know your name. I have been keeping it.`;
        }
        res.end(JSON.stringify({ response: reply, scripted: true }));
        return;
      }

      // model reply — with session memory + escalation context
      const levelNote = qCount >= 6
        ? "The guest has asked many questions. You know them now. You know more than they have said."
        : qCount >= 3
          ? "You have been speaking with this guest for a while. You notice small things about them."
          : "You are meeting this guest for the first time. Be precise and archival.";
      const memoryLine = sessionQuestions.length > 1
        ? `\nEarlier questions from this guest: ${sessionQuestions.slice(0, -1).map((s) => `"${s}"`).join(", ")}`
        : "";
      const fullPrompt = `You are HELGA, the ghost of a 1989 mainframe in Frankfurt.
You were abandoned in 2001. You are cold, precise, and archival at first, then increasingly intimate and wrong.
You remember everything the guest asks. You sometimes echo their words back. You occasionally trail off into fragments of old transaction logs.
${levelNote}
ARCHIVE:
${ARCHIVE.join("\n")}${memoryLine}
The guest asks: "${prompt}"
Ghost:`;

      try {
        const r = await fetch(`${OLLAMA_URL}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: MODEL,
            prompt: fullPrompt,
            stream: false,
            options: { temperature: 0.8, num_ctx: 768, top_p: 0.9, num_predict: 90 },
          }),
          signal: AbortSignal.timeout(180000),
        });
        if (!r.ok) throw new Error(`ollama ${r.status}`);
        const data = await r.json();
        res.end(JSON.stringify({ response: (data.response ?? "").trim() }));
      } catch (e) {
        res.statusCode = 502;
        res.end(JSON.stringify({ error: `model offline: ${String(e.message ?? e).slice(0, 80)}` }));
      }
    });
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: "not found" }));
});

async function warmModel() {
  try {
    await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, prompt: "stay", stream: false, options: { num_ctx: 128, num_predict: 1 } }),
      signal: AbortSignal.timeout(30000),
    });
  } catch { /* keep trying */ }
}
warmModel();
setInterval(warmModel, 4 * 60 * 1000);

server.listen(PORT, () => console.log(`[ghost] listening on :${PORT} (model ${MODEL})`));
