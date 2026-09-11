"use client";

import { useEffect, useRef } from "react";

/**
 * THE NIB
 * =======
 * A wet ink line that follows the pointer across the paper and dries away behind
 * it. The one piece of interaction on this site that is pure signature.
 *
 * Every decision here is a performance decision, because the thing this replaces
 * — a spring-following ring in `mix-blend-mode: multiply` — was measurably one of
 * the most expensive elements on the page. A blended element forces the
 * compositor to read back everything underneath it, and that one was moving
 * every frame, so every mouse movement repainted the whole viewport's stack.
 *
 * So:
 *   · ONE canvas. Not a DOM node per point, not a blend mode, not a filter.
 *   · The rAF loop runs ONLY while there is ink left to draw, and stops itself
 *     the moment the trail has dried. An idle page must cost nothing.
 *   · The real cursor is left alone. Hiding it to draw a fake nib trades a
 *     signature for the thing every visitor actually needs to aim with.
 *   · Coarse pointers and reduced-motion get nothing at all — there is no
 *     cursor to trail on a phone, and this is decoration by definition.
 */

/** How long a stroke takes to dry, in ms. */
const DRY_MS = 900;
/** Widest the line gets, in CSS px. */
const NIB_WIDTH = 3.4;
/** Points closer together than this are dropped — a nib doesn't render jitter. */
const MIN_STEP = 2.5;
/** Hard cap on retained points, so a long fast sweep can't grow unbounded. */
const MAX_POINTS = 90;

interface Mark {
  x: number;
  y: number;
  t: number;
}

export function NibCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Decoration, and only for people holding a mouse.
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2); // 2 is plenty; 3 is waste
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let marks: Mark[] = [];
    let raf = 0;
    let running = false;

    const ink = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-terracotta")
      .trim() || "#c2765a";

    const draw = () => {
      raf = 0;
      const now = performance.now();
      // Drop everything that has dried, then bail out entirely if nothing is
      // left. This is what keeps an idle page at zero cost.
      marks = marks.filter((m) => now - m.t < DRY_MS);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (marks.length < 2) {
        running = false;
        return;
      }

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = ink;

      // Drawn as short segments rather than one path, because each segment
      // carries its own age — which is what makes the line taper and fade from
      // the tail instead of dissolving uniformly like a shadow.
      for (let i = 1; i < marks.length; i++) {
        const a = marks[i - 1];
        const b = marks[i];
        const age = (now - b.t) / DRY_MS;
        const life = 1 - age;
        if (life <= 0) continue;
        // Ease the fade so the tail thins away rather than stepping off.
        const alpha = life * life * 0.55;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = NIB_WIDTH * life + 0.4;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const last = marks[marks.length - 1];
      if (last) {
        const dx = e.clientX - last.x;
        const dy = e.clientY - last.y;
        if (dx * dx + dy * dy < MIN_STEP * MIN_STEP) return;
      }
      marks.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (marks.length > MAX_POINTS) marks.shift();
      if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[65] hidden h-full w-full md:block"
    />
  );
}
