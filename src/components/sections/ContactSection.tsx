"use client";

import { useState } from "react";
import { useContent, useSectionDef } from "@/lib/store/content-store";
import { SectionShell } from "./SectionShell";
import { ChapterBackdrop } from "./ChapterBackdrop";
import { Plate } from "./ui";
import { Landmark } from "@/components/world/Landmark";

function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", "aria-hidden": true } as const;
  if (p.includes("mail"))
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M4 7l8 6 8-6" />
      </svg>
    );
  if (p.includes("linkedin"))
    return (
      <svg {...common} fill="currentColor">
        <path d="M4 4h4v16H4zM6 2a2 2 0 110 4 2 2 0 010-4zM10 8h4v2h.1c.6-1 2-2 3.9-2 4 0 4 3 4 5v7h-4v-6c0-1.5 0-3-2-3s-2 1.5-2 3v6h-4z" />
      </svg>
    );
  if (p.includes("github"))
    return (
      <svg {...common} fill="currentColor">
        <path d="M12 2a10 10 0 00-3.2 19.5c.5 0 .7-.2.7-.5v-2c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6 0-.6 0-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8 0-.7.3-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7 0-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.4 4.7-4.6 4.9.3.3.6.9.6 1.9v2.8c0 .3.2.6.7.5A10 10 0 0012 2z" />
      </svg>
    );
  if (p.includes("scholar"))
    return (
      <svg {...common} fill="currentColor">
        <path d="M12 3L1 9l11 6 9-4.9V17h2V9zM4 13.5V17c0 1.7 3.6 3 8 3s8-1.3 8-3v-3.5l-8 4.4z" />
      </svg>
    );
  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
    </svg>
  );
}

export function ContactSection({ active }: { active: boolean }) {
  // Chapter copy, live-editable from the Studio.
  const DEF = useSectionDef("contact");
  const content = useContent();
  const { profile } = content;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot — humans leave it empty
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socials = profile.socials.filter((s) => s.url);

  /** Opens the visitor's mail app — the escape hatch if the server is unreachable. */
  function openMailApp() {
    const params = new URLSearchParams({
      subject: `Hello from your portfolio — ${name || "a visitor"}`,
      body: `${message}\n\n— ${name}${email ? ` (${email})` : ""}`,
    });
    window.location.href = `mailto:${profile.email}?${params.toString()}`;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, body: message, company }),
      });
      const data = await res.json();
      if (data?.ok) {
        setSent(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError(data?.error ?? "That didn't send.");
      }
    } catch {
      // Offline or no backend — hand the message to their mail app instead.
      openMailApp();
      setSent(true);
    }
    setSending(false);
  }

  const field =
    "w-full rounded-lg border border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper-panel)] px-4 py-2.5 text-ink outline-none transition focus:border-[color:var(--color-teal-ink)]";

  return (
    <SectionShell
      active={active}
      accent={DEF.accent}
      eyebrow={DEF.eyebrow}
      title={DEF.title}
      subtitle={DEF.subtitle}
      background={<ChapterBackdrop variant="contact" />}
    >
      <div className="grid items-start gap-10 md:grid-cols-[0.9fr_1.1fr]">
        {/* the lighthouse + invitation */}
        <div className="text-center md:text-left">
          <div className="mx-auto inline-block md:mx-0">
            <Landmark region="horizon" size={168} />
          </div>
          <p className="mt-4 leading-relaxed text-ink-soft">
            An aspiring research candidate seeking impactful, interdisciplinary
            collaborations — and glad to build along the way. The lighthouse is lit;
            send word.
          </p>

          {socials.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              {socials.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.platform}
                  className="grid h-11 w-11 place-items-center rounded-full border transition-transform hover:-translate-y-0.5"
                  style={{
                    color: DEF.accent,
                    borderColor: `color-mix(in oklab, ${DEF.accent} 40%, transparent)`,
                    background: "var(--color-paper-panel)",
                  }}
                >
                  <SocialIcon platform={s.platform} />
                </a>
              ))}
            </div>
          )}

          <div className="mt-6">
            {profile.cvFileUrl ? (
              <a
                href={profile.cvFileUrl}
                className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-2.5 font-display font-semibold text-[color:var(--color-paper-panel)]"
                style={{ background: DEF.accent }}
              >
                Download CV ↓
              </a>
            ) : (
              <p className="hand text-lg text-ink-faint">
                (CV download appears once uploaded from the studio)
              </p>
            )}
          </div>
        </div>

        {/* the message bottle */}
        <Plate accent={DEF.accent}>
          {sent ? (
            <div className="py-10 text-center">
              <p className="font-display text-2xl" style={{ color: DEF.accent }}>
                Bon voyage ✦
              </p>
              <p className="mt-2 text-ink-soft">
                Your message is on its way — expect a reply at the address you gave.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="hand mt-4 text-lg underline"
                style={{ color: DEF.accent }}
              >
                write another
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-ink-soft" htmlFor="c-name">
                  Your name
                </label>
                <input
                  id="c-name"
                  className={field}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-ink-soft" htmlFor="c-email">
                  Your email
                </label>
                <input
                  id="c-email"
                  type="email"
                  className={field}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-ink-soft" htmlFor="c-msg">
                  Message
                </label>
                <textarea
                  id="c-msg"
                  rows={4}
                  className={`${field} resize-none`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              {/* Honeypot: off-screen, unlabelled, never focusable by a human. */}
              <input
                type="text"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              {error && (
                <p
                  role="alert"
                  className="text-center text-sm"
                  style={{ color: "var(--color-terracotta)" }}
                >
                  {error}{" "}
                  <button
                    type="button"
                    onClick={openMailApp}
                    className="underline underline-offset-4"
                  >
                    email directly instead
                  </button>
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-lg px-5 py-3 font-display font-semibold text-[color:var(--color-paper-panel)] transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                style={{ background: DEF.accent }}
              >
                {sending ? "Sending…" : "Send a message in a bottle →"}
              </button>
              <p className="text-center text-xs text-ink-faint">
                Goes straight to {profile.email}. Your address is used only to
                reply.
              </p>
            </form>
          )}
        </Plate>
      </div>
    </SectionShell>
  );
}
