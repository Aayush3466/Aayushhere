"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * A soft ink ring that trails the cursor with a gentle spring lag — a premium
 * signature that keeps the real cursor intact. Desktop pointers only.
 */
export function CursorFollower() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 280, damping: 26, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 280, damping: 26, mass: 0.4 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-7 w-7 rounded-full md:block"
      style={{
        x: sx,
        y: sy,
        marginLeft: -14,
        marginTop: -14,
        border: "1.5px solid color-mix(in oklab, var(--color-terracotta) 55%, transparent)",
        mixBlendMode: "multiply",
      }}
    />
  );
}
