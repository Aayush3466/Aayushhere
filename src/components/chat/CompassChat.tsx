"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useContent } from "@/lib/store/content-store";
import { answerFromContent, buildContext, type RefItem } from "@/lib/chat/retrieval";
import { CompassRose } from "@/components/CompassRose";
import { localId } from "@/lib/utils";

interface Msg {
  id: string;
  role: "user" | "bot";
  text?: string;
  intro?: string;
  items?: RefItem[];
}

const CHIPS = [
  "Recent projects",
  "What's under review?",
  "Does he know React?",
  "How do I get in touch?",
];

export function CompassChat() {
  const content = useContent();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([
        {
          id: localId("m"),
          role: "bot",
          intro: `Ahoy — I'm the ship's compass. Ask me anything about ${content.profile.name.split(" ")[0]}'s research, projects, education, or how to reach them. I only speak to what's on this chart.`,
        },
      ]);
    }
  }, [open, msgs.length, content.profile.name]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, loading]);

  async function ask(raw: string) {
    const q = raw.trim();
    if (!q || loading) return;
    setInput("");
    setMsgs((m) => [...m, { id: localId("m"), role: "user", text: q }]);
    setLoading(true);

    const r = answerFromContent(q, content);
    if (r.confident) {
      setMsgs((m) => [...m, { id: localId("m"), role: "bot", intro: r.intro, items: r.items }]);
      setLoading(false);
      return;
    }
    // open-ended → try the model, else use the polite deflection
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, context: buildContext(content) }),
      });
      const data = await res.json();
      if (data?.answer) {
        setMsgs((m) => [...m, { id: localId("m"), role: "bot", text: data.answer }]);
      } else {
        setMsgs((m) => [...m, { id: localId("m"), role: "bot", intro: r.intro, items: r.items }]);
      }
    } catch {
      setMsgs((m) => [...m, { id: localId("m"), role: "bot", intro: r.intro, items: r.items }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* the little island launcher — the guide hangs from the palm */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close the island guide" : "Ask the island guide"}
        className="fixed bottom-3 right-3 z-[60] origin-bottom-right scale-[0.68] transition-transform hover:-translate-y-1 sm:bottom-4 sm:right-4 sm:scale-100"
      >
        <IslandLauncher open={open} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            data-nav-ignore
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-5 z-[60] flex h-[70vh] max-h-[560px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl"
            style={{
              background: "var(--color-paper-panel)",
              border: "1px solid var(--color-paper-edge)",
              boxShadow: "0 30px 60px -24px rgba(58,46,26,0.6)",
            }}
          >
            <header
              className="flex items-center gap-3 border-b border-[color:var(--color-paper-edge)] px-4 py-3"
              style={{
                background:
                  "linear-gradient(180deg, color-mix(in oklab, var(--color-teal-ink) 10%, var(--color-paper-panel)), var(--color-paper-panel))",
              }}
            >
              <CompassRose size={30} />
              <div className="min-w-0">
                <p className="font-display font-semibold leading-none text-ink">The Compass</p>
                <p className="hand text-base leading-tight text-ink-faint">asks answered from the chart</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-[color:var(--color-paper-deep)] hover:text-ink"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {msgs.map((m) => (
                <Bubble key={m.id} msg={m} />
              ))}
              {loading && (
                <div className="hand text-lg text-ink-faint">consulting the chart…</div>
              )}
            </div>

            {msgs.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                {CHIPS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => ask(c)}
                    className="rounded-[var(--radius-pill)] border border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper)] px-2.5 py-1 text-xs text-ink-soft transition-colors hover:text-ink"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-2 border-t border-[color:var(--color-paper-edge)] p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about his work…"
                className="min-w-0 flex-1 rounded-lg border border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper)] px-3 py-2 text-sm text-ink outline-none focus:border-[color:var(--color-teal-ink)]"
              />
              <button
                type="submit"
                aria-label="Send"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[color:var(--color-paper-panel)]"
                style={{ background: "var(--color-teal-ink)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function IslandLauncher({ open }: { open: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* invite label */}
      <div
        className="hand mb-1 hidden whitespace-nowrap rounded-full px-3 py-0.5 text-base leading-none transition-opacity duration-300 sm:block"
        style={{
          background: "var(--color-paper-panel)",
          border: "1px solid var(--color-paper-edge)",
          color: "var(--color-ink-soft)",
          boxShadow: "0 6px 16px -10px rgba(58,46,26,0.5)",
          opacity: open ? 0 : 1,
        }}
      >
        {open ? "close" : "ask about me here"}
      </div>

      <svg
        width="120"
        height="113"
        viewBox="0 0 110 104"
        aria-hidden
        style={{ filter: "drop-shadow(0 8px 11px rgba(58,46,26,0.28))" }}
      >
        {/* water + island */}
        <ellipse cx="55" cy="94" rx="42" ry="7" fill="var(--color-sea-3)" opacity="0.55" />
        <path d="M18 94 Q55 74 92 94 Z" fill="color-mix(in oklab, var(--color-ochre) 46%, var(--color-paper))" />

        {/* palm on the right */}
        <path d="M80 92 Q75 68 84 50" fill="none" stroke="#8a5a3c" strokeWidth="4.5" strokeLinecap="round" />
        <g className={open ? "" : "anim-sway"} style={{ transformOrigin: "84px 50px" }}>
          <g fill="none" stroke="var(--color-sage)" strokeWidth="3.4" strokeLinecap="round">
            <path d="M84 50 Q71 42 58 46" />
            <path d="M84 50 Q77 35 67 29" />
            <path d="M84 50 Q86 34 90 26" />
            <path d="M84 50 Q96 36 106 43" />
          </g>
          <circle cx="81" cy="54" r="2.6" fill="#6b4a2f" />
          <circle cx="88" cy="55" r="2.6" fill="#6b4a2f" />
        </g>

        {/* little Aayush, one hand up on the trunk */}
        <g transform="translate(51,86) scale(1.42) translate(-51,-86)">
          {/* raised right arm reaching the trunk */}
          <path d="M52 76 Q66 68 78 58" fill="none" stroke="#2c3852" strokeWidth="4" strokeLinecap="round" />
          {/* suit body */}
          <path d="M41 93 C41 80 45 74 51 74 C57 74 61 80 61 93 Z" fill="#2c3852" />
          <path d="M51 76 L51 90" stroke="#201c14" strokeWidth="1.6" />
          {/* left arm */}
          <path d="M43 78 Q39 84 41 90" fill="none" stroke="#2c3852" strokeWidth="3.4" strokeLinecap="round" />
          {/* head */}
          <circle cx="51" cy="64" r="8.2" fill="#f0dcc0" stroke="var(--color-ink)" strokeWidth="1.2" />
          {/* hair quiff */}
          <path d="M43 62 C42 53 51 49 58 52 C62 54 62 60 60 63 C58 57 53 55 49 56 C46 57 44 60 43 62 Z" fill="#25211a" />
          {/* sunglasses */}
          <rect x="45" y="62" width="6" height="3.4" rx="1.4" fill="#1b1712" />
          <rect x="52" y="62" width="6" height="3.4" rx="1.4" fill="#1b1712" />
          {/* smile */}
          <path d="M48 68.5 Q51 70.5 54 68.5" fill="none" stroke="var(--color-ink)" strokeWidth="1" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  if (msg.role === "user") {
    return (
      <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm px-3 py-2 text-sm text-[color:var(--color-paper-panel)]" style={{ background: "var(--color-teal-ink)" }}>
        {msg.text}
      </div>
    );
  }
  return (
    <div className="w-fit max-w-[92%] rounded-2xl rounded-bl-sm border border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper)] px-3 py-2 text-sm text-ink">
      {msg.text && <p className="leading-relaxed">{msg.text}</p>}
      {msg.intro && <p className="leading-relaxed">{msg.intro}</p>}
      {msg.items && msg.items.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {msg.items.map((it, i) => (
            <li key={i} className="border-l-2 pl-2.5" style={{ borderColor: "var(--color-ochre)" }}>
              {it.url ? (
                <a href={it.url} target="_blank" rel="noreferrer" className="block font-semibold leading-snug underline decoration-1 underline-offset-2" style={{ color: "var(--color-teal-ink)" }}>
                  {it.title} ↗
                </a>
              ) : (
                <span className="block font-semibold leading-snug">{it.title}</span>
              )}
              {it.meta && <span className="mt-0.5 block text-xs text-ink-faint">{it.meta}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
