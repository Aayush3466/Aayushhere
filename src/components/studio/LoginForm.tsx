"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CompassRose } from "@/components/CompassRose";
import { signIn } from "@/lib/actions/auth";

/**
 * The chart-keeper's entrance. Deliberately quiet: one plate of paper floating
 * on the sea, a compass that turns while it thinks, and no hint anywhere of
 * whether a given email exists.
 */
export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await signIn(email, password);
      if (res.ok) {
        router.replace("/studio");
        router.refresh();
      } else {
        setError(res.error ?? "That didn't work.");
      }
    });
  }

  const field =
    "w-full rounded-lg border border-[color:var(--color-paper-edge)] bg-[color:var(--color-paper)] px-4 py-2.5 text-ink outline-none transition-colors placeholder:text-ink-faint/70 focus:border-[color:var(--color-teal-ink)]";

  return (
    <main className="relative grid min-h-[100dvh] place-items-center overflow-hidden px-5">
      {/* The sea, far below the plate. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            "linear-gradient(180deg, transparent, color-mix(in oklab, var(--color-sea-2) 55%, transparent))",
        }}
      />
      <div className="paper-grain" aria-hidden />
      <div className="paper-vignette" aria-hidden />

      <form
        onSubmit={submit}
        className="paper-panel relative z-10 w-full max-w-sm px-7 py-9 text-center"
        style={{ animation: "ink-bloom 0.7s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="mx-auto mb-4 w-fit">
          <CompassRose size={72} spin={pending} />
        </div>

        <p className="map-eyebrow">The Cartographer</p>
        <h1 className="mt-2 text-3xl">Studio</h1>
        <p className="hand mt-1 text-xl text-ink-soft">chart-keeper&rsquo;s entrance</p>

        <hr className="ink-rule my-6" />

        {!configured ? (
          <p className="text-sm text-ink-soft">
            No backend is configured yet. Add your Supabase keys to{" "}
            <code>.env.local</code> and run <code>npm run setup</code>.
          </p>
        ) : (
          <>
            <div className="space-y-3 text-left">
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-faint">
                  Email
                </span>
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={field}
                  placeholder="you@example.com"
                  autoFocus
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-faint">
                  Password
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={field}
                  placeholder="••••••••••"
                  required
                />
              </label>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-3 text-sm"
                style={{ color: "var(--color-terracotta)" }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-5 w-full rounded-lg px-5 py-3 font-display font-semibold text-[color:var(--color-paper-panel)] transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              style={{ background: "var(--color-teal-ink)" }}
            >
              {pending ? "Taking a bearing…" : "Enter the studio"}
            </button>
          </>
        )}

        <Link
          href="/"
          className="mt-6 inline-block text-sm text-ink-faint underline-offset-4 hover:underline"
        >
          ← back to the chart
        </Link>
      </form>
    </main>
  );
}
