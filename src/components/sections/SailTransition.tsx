"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PaperBoat } from "@/components/world/PaperBoat";

/**
 * THE TIDE WASH — the chapter transition. Instead of a rigid shape sliding, a
 * tide floods UP from the bottom, its surface rippling as layered wave bands
 * drift horizontally (real, continuous flow), holds for a beat, then drains away
 * to reveal the new chapter. The paper boat rides the swell. Skipped when the
 * visitor prefers reduced motion (the plain slide remains).
 */

// One tileable crest: period 120 across a 720-wide viewBox (6 periods), so a
// 200%-wide band drifting -50% (=360 units = 3 periods) loops seamlessly.
const WAVE =
  "M0,44 C30,16 30,16 60,44 C90,72 90,72 120,44 C150,16 150,16 180,44 C210,72 210,72 240,44 C270,16 270,16 300,44 C330,72 330,72 360,44 C390,16 390,16 420,44 C450,72 450,72 480,44 C510,16 510,16 540,44 C570,72 570,72 600,44 C630,16 630,16 660,44 C690,72 690,72 720,44 L720,600 L0,600 Z";

function FloodBand({
  top,
  color,
  opacity,
  dur,
  reverse = false,
}: {
  top: string;
  color: string;
  opacity: number;
  dur: number;
  reverse?: boolean;
}) {
  return (
    <div
      className="will-move absolute left-0"
      style={{
        top,
        height: "130%",
        width: "200%",
        animation: `wave-drift ${dur}s linear infinite ${reverse ? "reverse" : "normal"}`,
      }}
    >
      <svg viewBox="0 0 720 600" preserveAspectRatio="none" width="100%" height="100%">
        <path d={WAVE} fill={color} opacity={opacity} />
      </svg>
    </div>
  );
}

export function SailTransition({
  trigger,
  direction,
}: {
  trigger: number;
  direction: number;
}) {
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduce) return;
    setPlaying(true);
    const t = setTimeout(() => setPlaying(false), 540);
    return () => clearTimeout(t);
  }, [trigger, reduce]);

  const fwd = direction >= 0;

  return (
    <AnimatePresence>
      {playing && (
        <motion.div key={trigger} className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
          <motion.div
            className="will-move absolute inset-x-0 bottom-0"
            style={{ height: "122vh" }}
            initial={{ y: "100%" }}
            animate={{ y: ["100%", "-8%", "-8%", "100%"] }}
            transition={{
              duration: 0.48,
              times: [0, 0.42, 0.56, 1],
              ease: [
                [0.16, 0.84, 0.32, 1], // flood up
                "linear", // hold
                [0.6, 0, 0.75, 0.35], // drain
              ],
            }}
          >
            {/* the water body */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, color-mix(in oklab, var(--color-sea-1) 78%, var(--color-sky-low)) 0%, var(--color-sea-3) 34%, var(--color-sea-4) 100%)",
              }}
            />
            {/* rippling, drifting surface — this is the flow */}
            <FloodBand top="-3%" color="color-mix(in oklab, var(--color-sea-1) 72%, white)" opacity={0.9} dur={2.4} />
            <FloodBand top="5%" color="var(--color-sea-2)" opacity={0.85} dur={3.3} reverse />
            <FloodBand top="15%" color="var(--color-sea-3)" opacity={0.82} dur={2.8} />
            <FloodBand top="30%" color="var(--color-sea-4)" opacity={0.9} dur={3.8} reverse />

            {/* foam glints along the crest */}
            <div
              className="absolute inset-x-0"
              style={{
                top: "1%",
                height: "10px",
                background:
                  "repeating-linear-gradient(90deg, transparent 0 26px, rgba(255,255,255,0.5) 26px 30px)",
                maskImage: "linear-gradient(180deg, black, transparent)",
                opacity: 0.5,
              }}
            />

            {/* the boat rides the swell */}
            <div
              className="anim-boat absolute"
              style={{ top: "4%", left: fwd ? "58%" : "34%" }}
            >
              <PaperBoat style={{ position: "relative" }} width={122} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
