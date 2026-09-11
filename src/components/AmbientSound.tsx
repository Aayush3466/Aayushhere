"use client";

import { useRef, useState } from "react";

/**
 * A faint, synthesised ocean ambience (brown noise → lowpass, with a slow LFO
 * swell) — no audio asset needed. Off by default; one tap toggles it.
 */
export function AmbientSound() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  function toggle() {
    if (on) {
      const ctx = ctxRef.current;
      if (ctx && gainRef.current) {
        gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        window.setTimeout(() => ctx.suspend(), 600);
      }
      setOn(false);
      return;
    }

    let ctx = ctxRef.current;
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      ctxRef.current = ctx;

      const size = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < size; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.2;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      // 500 Hz cut almost everything the ear registers as "sea" and left the
      // ambience inaudible without a phone pressed to it. Brown noise is
      // bottom-heavy to begin with; this keeps the wash soft while letting
      // enough through to actually be heard.
      lp.frequency.value = 820;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gainRef.current = gain;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.14;
      lfo.connect(lfoGain).connect(gain.gain);
      src.connect(lp).connect(gain).connect(ctx.destination);
      src.start();
      lfo.start();
    }
    ctx.resume();
    // 0.09 was roughly -21 dB of already-filtered noise — inaudible on laptop
    // speakers at a normal volume. This lands as a quiet room-tone, still well
    // under anything that would talk over a video in another tab.
    gainRef.current?.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.9);
    setOn(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? "Mute ambience" : "Play ambience"}
      className="pop fixed bottom-4 left-4 z-[60] grid h-12 w-12 place-items-center rounded-full"
      style={{
        background: "var(--color-paper-panel)",
        border: "1px solid var(--color-paper-edge)",
        boxShadow: "0 10px 26px -14px rgba(58,46,26,0.5)",
        color: "var(--color-teal-ink)",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" stroke="none" />
        {on ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 6a9 9 0 0 1 0 12" />
          </>
        ) : (
          <path d="M17 9l4 6m0-6l-4 6" />
        )}
      </svg>
    </button>
  );
}
