"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * ENVIRONMENT — the world reacts to the visitor's local time. Phase drives a
 * day/night palette (via data-phase on <html>) and the two live clocks in the
 * nav: the visitor's time and Aayush's time in Kathmandu. Pure client clock —
 * no external calls, so it's always reliable and privacy-friendly.
 */
export type Phase = "dawn" | "day" | "dusk" | "night";

interface Env {
  now: Date | null;
  phase: Phase;
  localTime: string;
  kathmanduTime: string;
}

const Ctx = createContext<Env>({ now: null, phase: "day", localTime: "", kathmanduTime: "" });

function phaseFor(hour: number): Phase {
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

function fmt(d: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    ...(timeZone ? { timeZone } : {}),
  }).format(d);
}

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  // null on the server + first client render (avoids a clock hydration mismatch)
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  const phase: Phase = now ? phaseFor(now.getHours()) : "day";

  useEffect(() => {
    document.documentElement.setAttribute("data-phase", phase);
  }, [phase]);

  return (
    <Ctx.Provider
      value={{
        now,
        phase,
        localTime: now ? fmt(now) : "",
        kathmanduTime: now ? fmt(now, "Asia/Kathmandu") : "",
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useEnvironment = () => useContext(Ctx);
