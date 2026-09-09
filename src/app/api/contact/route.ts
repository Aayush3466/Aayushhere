import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPublicClient } from "@/lib/supabase/read";

/**
 * THE LIGHTHOUSE — contact delivery.
 *
 * A message is STORED FIRST and emailed second. Email is the part that can fail
 * (a bounced key, a suspended domain, a Resend outage) and a portfolio losing a
 * collaboration enquiry to a transient 500 is the one failure that actually
 * costs something. So a stored message counts as delivered, and the email is
 * best-effort on top; the Studio inbox is the durable record either way.
 *
 * The insert runs on the publishable key, exercising the same RLS policy a
 * browser would — the public may insert into `messages` and may never read it.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

const Message = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  body: z.string().trim().min(1).max(5000),
  // Honeypot: a real person never fills a field they cannot see. It is
  // deliberately permissive here — rejecting it as a validation error would
  // tell a bot precisely which field caught it, and would turn a browser
  // autofilling the hidden input into a baffling error for a real visitor.
  // The check happens after parsing instead, and answers with a bland success.
  company: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many messages just now — try again in a minute." },
      { status: 429 },
    );
  }

  let parsed;
  try {
    parsed = Message.safeParse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check your name, email and message." },
      { status: 400 },
    );
  }

  const { name, email, body, company } = parsed.data;
  // Silently accept the bot's submission so it learns nothing from the response.
  if (company) return NextResponse.json({ ok: true, stored: false });

  const db = getPublicClient();
  if (!db) {
    return NextResponse.json(
      { ok: false, error: "The message store isn't configured yet." },
      { status: 503 },
    );
  }

  const { error } = await db.from("messages").insert({ name, email, body });
  if (error) {
    return NextResponse.json(
      { ok: false, error: "Couldn't save that message. Please email directly instead." },
      { status: 502 },
    );
  }

  void sendEmail({ name, email, body });

  return NextResponse.json({ ok: true, stored: true });
}

/** Best-effort notification. Never blocks or fails the request. */
async function sendEmail({
  name,
  email,
  body,
}: {
  name: string;
  email: string;
  body: string;
}) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) return;

  const escape = (s: string) =>
    s.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
    );

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Resend's shared sender works without a verified domain; replying goes
        // to the visitor rather than to this address.
        from: "Portfolio <onboarding@resend.dev>",
        to: [to],
        reply_to: email,
        subject: `Portfolio message from ${name}`,
        html: `<p><strong>${escape(name)}</strong> &lt;${escape(email)}&gt; wrote:</p>
<p style="white-space:pre-wrap">${escape(body)}</p>`,
      }),
    });
  } catch {
    // The message is already stored; the Studio inbox is the source of truth.
  }
}
