"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Gives a plate the weight of a real object: it leans a degree or two toward the
 * cursor and catches the light where the pointer is.
 *
 * Written straight to CSS custom properties rather than through React state —
 * a pointermove handler that re-rendered on every frame would make the whole
 * chapter janky. The transform itself is done by the compositor.
 *
 * Silent no-op with reduced motion, and on coarse pointers there is no cursor
 * to lean toward, so touch devices simply get the flat card.
 */
export function Tilt({
  children,
  className,
  style,
  max = 3.2,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Maximum lean in degrees. Small on purpose — this should be felt, not seen. */
  max?: number;
  as?: "div" | "li" | "article";
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const frame = useRef(0);

  function onMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;

    // Coalesce to one write per frame; pointermove can fire far faster.
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--ry", `${(px - 0.5) * 2 * max}deg`);
      el.style.setProperty("--rx", `${(0.5 - py) * 2 * max}deg`);
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      el.dataset.tracking = "1";
    });
  }

  function reset() {
    const el = ref.current;
    if (!el) return;
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    el.dataset.tracking = "0";
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <Tag
      // One generic ref for three possible tags — the DOM node is an HTMLElement
      // in every case, which is all the handlers need.
      ref={ref as React.Ref<never>}
      className={cn("tilt sheen", className)}
      style={style}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </Tag>
  );
}
