import { NextRequest, NextResponse } from "next/server";

/**
 * OPTIONAL MODEL FALLBACK (Groq) for open-ended questions the client-side
 * retrieval couldn't confidently answer. The key stays server-side; requests
 * are rate-limited per visitor; any problem returns { fallback: true } so the
 * chatbot silently uses its retrieval answer instead. Never drains, never leaks.
 *
 * Set GROQ_API_KEY (and optionally CHAT_MODEL) in .env.local to enable.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 25;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

function systemPrompt(context: string): string {
  return `You are the warm, concise assistant for a personal research & development portfolio. Answer ONLY using the CONTEXT about the person below. If a question cannot be answered from the CONTEXT, say you can only discuss their work and suggest asking about research, projects, education, experience, skills, or contact. Never invent facts, links, employers, publications or dates. Keep answers to 2–4 sentences.

IMPORTANT: Reply in the SAME language the user wrote in. If they ask in Nepali, answer in Nepali; if Hindi, answer in Hindi; if Spanish, answer in Spanish, and so on. Match their language naturally.

CONTEXT:
${context}`;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return NextResponse.json({ fallback: true, reason: "rate-limit" });

  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!groqKey && !geminiKey) return NextResponse.json({ fallback: true, reason: "no-key" });

  let body: { question?: string; context?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ fallback: true, reason: "bad-body" });
  }
  const question = (body.question ?? "").slice(0, 500);
  const context = (body.context ?? "").slice(0, 8000);
  if (!question) return NextResponse.json({ fallback: true, reason: "empty" });

  const sys = systemPrompt(context);
  try {
    // Prefer Gemini when its key is present, else Groq.
    const answer = geminiKey
      ? await askGemini(geminiKey, sys, question)
      : await askGroq(groqKey as string, sys, question);
    if (!answer) return NextResponse.json({ fallback: true, reason: "empty-answer" });
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ fallback: true, reason: "exception" });
  }
}

async function askGroq(key: string, sys: string, question: string): Promise<string | null> {
  const model = process.env.CHAT_MODEL || "llama-3.1-8b-instant";
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 400,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: question },
      ],
    }),
    signal: AbortSignal.timeout(9000),
  });
  if (!r.ok) return null;
  const data = await r.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? null;
}

async function askGemini(key: string, sys: string, question: string): Promise<string | null> {
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sys }] },
        contents: [{ role: "user", parts: [{ text: question }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
      }),
      signal: AbortSignal.timeout(9000),
    },
  );
  if (!r.ok) return null;
  const data = await r.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
}
