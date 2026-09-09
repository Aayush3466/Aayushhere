"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface TypingResult {
  wpm: number;
  accuracy: number;
  seconds: number;
}

/**
 * A focused typing test. An invisible textarea captures input (works on mobile
 * too); the visible text lights up char-by-char. WPM is (correct chars / 5) per
 * minute; accuracy is correct / typed. Completing the text fires `onComplete`.
 */
export function TypingTest({
  text,
  accent,
  mono = false,
  onComplete,
}: {
  text: string;
  accent: string;
  mono?: boolean;
  onComplete: (r: TypingResult) => void;
}) {
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const doneRef = useRef(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    taRef.current?.focus();
  }, []);

  useEffect(() => {
    if (startedAt == null) return;
    const id = setInterval(() => setTick((t) => t + 1), 200);
    return () => clearInterval(id);
  }, [startedAt]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (doneRef.current) return;
    let v = e.target.value;
    if (v.length > text.length) v = v.slice(0, text.length);
    if (startedAt == null && v.length > 0) setStartedAt(performance.now());
    setTyped(v);
    if (v.length >= text.length) finish(v);
  }

  function finish(v: string) {
    doneRef.current = true;
    const end = performance.now();
    const start = startedAt ?? end;
    const seconds = Math.max(0.5, (end - start) / 1000);
    let correct = 0;
    for (let i = 0; i < text.length; i++) if (v[i] === text[i]) correct++;
    const accuracy = Math.round((correct / (v.length || 1)) * 100);
    const wpm = Math.max(0, Math.round(correct / 5 / (seconds / 60)));
    onComplete({ wpm, accuracy, seconds: Math.round(seconds) });
  }

  const elapsed = startedAt != null ? (performance.now() - startedAt) / 1000 : 0;
  void tick; // re-render heartbeat for the live timer

  return (
    <div className="relative cursor-text" onClick={() => taRef.current?.focus()}>
      <textarea
        ref={taRef}
        value={typed}
        onChange={handleChange}
        aria-label="Typing test input"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        className="absolute inset-0 z-10 h-full w-full resize-none rounded-xl opacity-0"
      />
      <div
        className={cn(
          "select-none rounded-xl border p-5 text-xl leading-relaxed",
          mono ? "whitespace-pre-wrap font-mono text-base leading-7" : "leading-relaxed",
        )}
        style={{ borderColor: "var(--color-paper-edge)", background: "var(--color-paper-panel)" }}
      >
        {text.split("").map((ch, i) => {
          const done = i < typed.length;
          const current = i === typed.length;
          const correct = done && typed[i] === ch;
          return (
            <span
              key={i}
              style={{
                color: current
                  ? "var(--color-ink)"
                  : done
                    ? correct
                      ? "var(--color-ink)"
                      : "var(--color-terracotta)"
                    : "var(--color-ink-faint)",
                background: current
                  ? `color-mix(in oklab, ${accent} 32%, transparent)`
                  : done && !correct
                    ? "color-mix(in oklab, var(--color-terracotta) 16%, transparent)"
                    : "transparent",
                borderRadius: current ? 3 : undefined,
                textDecoration: done && !correct ? "underline" : undefined,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      <div className="mt-3 flex gap-6 text-sm text-ink-soft">
        <span>⏱ {elapsed.toFixed(1)}s</span>
        <span>
          {typed.length}/{text.length}
        </span>
      </div>
    </div>
  );
}
