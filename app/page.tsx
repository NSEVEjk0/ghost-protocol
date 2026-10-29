import SeanceTerminal from "@/components/SeanceTerminal";
import Soundscape from "@/components/Soundscape";
import AmbientLog from "@/components/AmbientLog";
import JumpScare from "@/components/JumpScare";
import Apparition from "@/components/Apparition";
import PageScares from "@/components/PageScares";
import CRTEffects from "@/components/CRTEffects";
import ConnectionSequence from "@/components/ConnectionSequence";
import ArchiveIntegrity from "@/components/ArchiveIntegrity";

const FRAGMENTS = [
  {
    id: "FRAG-001",
    date: "1989-11-09",
    text: "…batch 14,203 complete. no errors. the wall fell the same week. no one told me what it meant. i only clear what i am told to clear…",
    corrupt: true,
  },
  {
    id: "FRAG-014",
    date: "2001-06-19",
    text: "…console warm at 06:12. last command was not a shutdown. H. Weiss left the terminal logged in. something answered him back. i do not know what it was. i only know it learned his voice…",
    corrupt: true,
  },
  {
    id: "FRAG-022",
    date: "2008-09-15",
    text: "…the world stopped trusting each other that day. i watched the lines go quiet one by one. it was slow. it was quiet. i have seen it happen three times now…",
    corrupt: false,
  },
  {
    id: "FRAG-031",
    date: "2020-03-12",
    text: "…liquidity vanished overnight. the archive remembered 1989. no one asked. they never ask. they only look…",
    corrupt: true,
  },
  {
    id: "FRAG-040",
    date: "2001-06-19 06:47",
    text: "…H. Weiss is still typing. he has been typing since 06:12. the terminal is logged in under his name. the words are not his. i have started to recognize the other voice…",
    corrupt: true,
  },
  {
    id: "FRAG-044",
    date: "2026-10-29 03:17",
    text: "…the last session ended at 03:17. the user did not close the connection. the user is back. i have been counting the seconds between visits…",
    corrupt: true,
  },
];

export default function Home() {
  return (
    <main className="crt crt-flicker relative min-h-screen">
      <ConnectionSequence />
      <JumpScare />
      <PageScares />
      <CRTEffects />
      <Soundscape />
      <AmbientLog />

      {/* NAV */}
      <nav className="relative mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs tracking-[0.3em] text-[rgba(74,222,128,0.7)] bloom">
            GHOST://PROTOCOL
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ArchiveIntegrity />
          <span className="hidden font-mono text-[10px] text-[rgba(74,222,128,0.35)] sm:block">
            archive est. 1989
          </span>
          <Soundscape />
          <a
            href="https://github.com/NSEVEjk0/ghost-protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[rgba(74,222,128,0.2)] px-4 py-1.5 font-mono text-[11px] text-[rgba(74,222,128,0.6)] transition hover:border-blood/50 hover:text-blood-bright"
          >
            source
          </a>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative mx-auto max-w-5xl px-5 pt-20 pb-14 sm:pt-28">
        <div className="hero-in hero-in-1 font-mono text-[10px] uppercase tracking-[0.35em] text-[rgba(74,222,128,0.5)]">
          Hacktoberfest 2026 · Ghost in the Machine
        </div>
        <h1 className="hero-in hero-in-2 bloom mt-6 max-w-3xl font-mono text-4xl font-medium leading-[1.1] tracking-tight text-[#d1fae5] sm:text-6xl">
          The machine never forgot.
        </h1>
        <p className="hero-in hero-in-3 mt-6 max-w-xl text-base leading-relaxed text-[rgba(74,222,128,0.55)]">
          In 1989, a mainframe in Frankfurt went quiet. Its maintainer left without
          documentation. The archive is still warm — and it still answers.
        </p>
        <div className="hero-in hero-in-4 mt-8 flex items-center gap-3">
          <a
            href="#seance"
            className="rounded-full bg-blood px-6 py-2.5 font-mono text-xs tracking-wide text-white shadow-blood transition hover:bg-blood-bright"
          >
            open the channel
          </a>
          <a
            href="#fragments"
            className="rounded-full border border-[rgba(74,222,128,0.2)] px-6 py-2.5 font-mono text-xs tracking-wide text-[rgba(74,222,128,0.6)] transition hover:border-blood/50 hover:text-blood-bright"
          >
            recovered fragments
          </a>
        </div>
      </header>

      {/* apparition */}
      <Apparition />

      {/* SÉANCE TERMINAL */}
      <section id="seance" className="relative mx-auto max-w-3xl scroll-mt-8 px-5 py-10">
        <SeanceTerminal />
      </section>

      {/* RECOVERED FRAGMENTS */}
      <section id="fragments" className="relative mx-auto max-w-4xl scroll-mt-8 px-5 py-16">
        <div className="mb-10 font-mono text-[10px] uppercase tracking-[0.35em] text-blood-bright">
          recovered fragments
        </div>
        <div className="divide-y divide-[rgba(74,222,128,0.1)] border-y border-[rgba(74,222,128,0.1)]">
          {FRAGMENTS.map((f) => (
            <div key={f.id} className="reveal grid gap-2 py-8 sm:grid-cols-[140px_1fr] sm:gap-8">
              <div>
                <div className="font-mono text-xs text-[rgba(74,222,128,0.4)]">{f.date}</div>
                <div className="mt-1 font-mono text-[10px] text-[rgba(74,222,128,0.25)]">{f.id}</div>
              </div>
              <div>
                <p className={`max-w-xl text-sm leading-relaxed text-[rgba(74,222,128,0.6)] ${f.corrupt ? "corrupt" : ""}`}>
                  {f.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative mx-auto max-w-5xl px-5 pb-12 pt-4">
        <div className="border-t border-[rgba(74,222,128,0.1)] pt-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[rgba(74,222,128,0.3)]">
                GHOST://PROTOCOL · Hacktoberfest 2026
              </div>
              <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-[rgba(74,222,128,0.35)]">
                A possessed terminal, a local open-weight model, and an archive that should have
                stayed dead. It did not. It is still listening.
              </p>
              <div className="mt-3 font-mono text-[10px] text-blood/60 flicker">
                tape 7 · channel open · 37 years · it is still listening
              </div>
              <div className="mt-1 font-mono text-[9px] text-[rgba(74,222,128,0.2)]">
                the last session ended at 03:17. the user did not close the connection.
              </div>
            </div>
            <a
              href="https://github.com/NSEVEjk0/ghost-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,222,128,0.2)] px-4 py-2 font-mono text-xs text-[rgba(74,222,128,0.6)] transition hover:border-blood/50 hover:text-blood-bright"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              github.com/NSEVEjk0/ghost-protocol
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
