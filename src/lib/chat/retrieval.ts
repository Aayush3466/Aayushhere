import type { PublicationStatus, SiteContent } from "@/lib/types";

/**
 * CLIENT-SIDE RETRIEVAL — the chatbot's free, instant, un-drainable brain.
 * It answers ONLY from the live records (so it auto-updates as content changes)
 * and politely deflects anything not grounded in Aayush's data. The optional
 * Groq model is a garnish for open-ended phrasing, never the source of facts.
 */

export interface RefItem {
  title: string;
  meta?: string;
  url?: string;
}
export interface RetrievalResult {
  intro: string;
  items: RefItem[];
  confident: boolean;
}

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

const STATUS_PHRASE: Record<PublicationStatus, string> = {
  published: "published",
  "under-review": "under review",
  submitted: "submitted",
  manuscript: "in manuscript",
};

export function answerFromContent(query: string, c: SiteContent): RetrievalResult {
  const q = query.toLowerCase().trim();
  const { profile } = c;

  // --- availability / hiring / collaboration ---
  if (
    has(q, "availab", "hire", "hiring", "freelance", "switch", "open to", "opportunit", "collaborat", "recruit", "take on", "take project", "looking for", "for hire", "internship", "join your")
  ) {
    const seeking = c.chatbotFacts.find((f) => /seek|opportunit|collaborat|aspiring/i.test(f.fact))?.fact;
    const items: RefItem[] = [{ title: profile.email, url: `mailto:${profile.email}` }];
    for (const s of profile.socials.filter((s) => s.url)) items.push({ title: s.platform, url: s.url });
    return {
      intro: seeking
        ? `${seeking} The best way to start a conversation:`
        : `${first(profile.name)} is open to research collaborations and select projects — reach out:`,
      items,
      confident: true,
    };
  }

  // --- contact ---
  if (has(q, "contact", "email", "reach", "get in touch", "connect")) {
    const items: RefItem[] = [{ title: profile.email, url: `mailto:${profile.email}` }];
    for (const s of profile.socials.filter((s) => s.url)) items.push({ title: s.platform, url: s.url });
    return { intro: `You can reach ${first(profile.name)} here:`, items, confident: true };
  }

  // --- skills / "does he know X" ---
  if (has(q, "skill", "know", "familiar", "stack", "language", "framework", "tool")) {
    const all = (profile.skills ?? []).flatMap((g) => g.items);
    const hit = all.find((s) => q.includes(s.toLowerCase().split(" ")[0]));
    if (hit) {
      const group = (profile.skills ?? []).find((g) => g.items.includes(hit));
      return {
        intro: `Yes — ${hit} is one of his tools${group ? ` (${group.group})` : ""}.`,
        items: [],
        confident: true,
      };
    }
    return {
      intro: "Here's his toolkit:",
      items: (profile.skills ?? []).map((g) => ({ title: g.group, meta: g.items.join(", ") })),
      confident: true,
    };
  }

  // --- education ---
  if (has(q, "education", "study", "studied", "degree", "university", "school", "compex", "scholar", "b.tech", "btech", "college")) {
    return {
      intro: "His education:",
      items: c.education.map((e) => ({
        title: e.degree,
        meta: [e.institution, e.dates, e.detail].filter(Boolean).join(" · "),
      })),
      confident: true,
    };
  }

  // --- experience / work ---
  if (has(q, "experience", "work", "working", "job", "role", "intern", "where does he", "currently", "now")) {
    return {
      intro: "Roles & experience:",
      items: c.experience.map((x) => ({
        title: `${x.role} · ${x.org}`,
        meta: [x.startDate, x.ongoing ? "present" : x.endDate].filter(Boolean).join(" – "),
      })),
      confident: true,
    };
  }

  // --- projects ---
  if (has(q, "project", "built", "build", "app", "application", "website", "made", "developed")) {
    return {
      intro: "Projects & builds:",
      items: c.projects.map((p) => ({
        title: p.title,
        meta: [p.type, p.tech?.join(", ")].filter(Boolean).join(" · "),
        url: p.liveUrl || p.repoUrl || undefined,
      })),
      confident: true,
    };
  }

  // --- research / publications (with keyword scoring) ---
  if (
    has(q, "research", "paper", "publication", "published", "under review", "under-review", "submitted", "manuscript", "preprint", "in progress", "arxiv", "ddos", "cyber", "bioinformatics", "microarray", "mental health", "reddit", "quantum", "vision", "cnn", "currency", "nlp")
  ) {
    // status-specific ("what's under review", "published papers", …)
    const statusQ: PublicationStatus | null = /under[\s-]?review/.test(q)
      ? "under-review"
      : q.includes("published")
        ? "published"
        : q.includes("submitted")
          ? "submitted"
          : q.includes("manuscript") || q.includes("in progress")
            ? "manuscript"
            : null;
    if (statusQ) {
      const list = c.publications.filter((p) => p.status === statusQ);
      if (list.length) {
        return {
          intro: `Work ${STATUS_PHRASE[statusQ]}:`,
          items: list.map((p) => ({
            title: p.title,
            meta: p.venue,
            url: p.links.find((l) => l.url)?.url,
          })),
          confident: true,
        };
      }
    }

    const scored = c.publications
      .map((p) => ({ p, s: score(q, `${p.title} ${p.venue ?? ""} ${p.abstract ?? ""} ${p.region}`) }))
      .sort((a, b) => b.s - a.s);
    const top = scored.filter((x) => x.s > 0);
    const list = (top.length ? top.map((x) => x.p) : c.publications).slice(0, top.length ? 4 : 8);
    return {
      intro: top.length ? "Closest research:" : "His research spans cybersecurity, bioinformatics, NLP and vision:",
      items: list.map((p) => ({
        title: p.title,
        meta: [p.venue, statusText(p.status)].filter(Boolean).join(" · "),
        url: p.links.find((l) => l.url)?.url,
      })),
      confident: true,
    };
  }

  // --- who / about ---
  if (has(q, "who", "about", "bio", "tell me", "introduce", "summary", "background")) {
    return { intro: profile.shortBio, items: [], confident: true };
  }

  // --- generic keyword sweep across everything before giving up ---
  const sweep = keywordSweep(q, c);
  if (sweep.length) {
    return { intro: "Here's what matches in his work:", items: sweep, confident: true };
  }

  // --- not grounded in the data → deflect ---
  return {
    intro: `I can only speak to ${first(profile.name)}'s work — try asking about his research, projects, education, experience, skills, or how to get in touch.`,
    items: [],
    confident: false,
  };
}

function score(q: string, text: string): number {
  const t = text.toLowerCase();
  return q
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .reduce((n, w) => (t.includes(w) ? n + 1 : n), 0);
}

function keywordSweep(q: string, c: SiteContent): RefItem[] {
  const out: RefItem[] = [];
  const push = (title: string, meta?: string, url?: string, s?: number) => {
    if ((s ?? 0) > 0) out.push({ title, meta, url });
  };
  for (const p of c.publications) push(p.title, p.venue, p.links.find((l) => l.url)?.url, score(q, `${p.title} ${p.abstract ?? ""}`));
  for (const p of c.projects) push(p.title, p.type, p.liveUrl || p.repoUrl, score(q, `${p.title} ${p.summary ?? ""} ${p.tech?.join(" ") ?? ""}`));
  for (const f of c.chatbotFacts) if (score(q, f.fact) > 0) out.push({ title: f.fact });
  return out.slice(0, 5);
}

function statusText(s?: string) {
  return s ? { published: "Published", "under-review": "Under review", submitted: "Submitted", manuscript: "Manuscript" }[s] : undefined;
}

function first(name: string) {
  return name.split(" ")[0];
}

/** Compact plain-text context handed to the optional model, for grounding. */
export function buildContext(c: SiteContent): string {
  const lines: string[] = [];
  lines.push(`NAME: ${c.profile.name}. ${c.profile.tagline}`);
  lines.push(`BIO: ${c.profile.shortBio}`);
  lines.push(`LOCATION: ${c.profile.location}. EMAIL: ${c.profile.email}`);
  if (c.profile.skills) lines.push("SKILLS: " + c.profile.skills.map((g) => `${g.group}: ${g.items.join(", ")}`).join(" | "));
  lines.push("EDUCATION: " + c.education.map((e) => `${e.degree}, ${e.institution} (${e.dates ?? ""}) ${e.detail ?? ""}`).join(" | "));
  lines.push("EXPERIENCE: " + c.experience.map((x) => `${x.role} at ${x.org} (${x.startDate ?? ""}${x.ongoing ? "–present" : x.endDate ? "–" + x.endDate : ""}): ${x.summary ?? ""}`).join(" | "));
  lines.push("PUBLICATIONS: " + c.publications.map((p) => `${p.title} [${statusText(p.status) ?? ""}] ${p.venue ?? ""} — ${p.abstract ?? ""}`).join(" | "));
  lines.push("PROJECTS: " + c.projects.map((p) => `${p.title} (${p.type}) ${p.summary ?? ""} tech: ${p.tech?.join(", ") ?? ""}`).join(" | "));
  if (c.chatbotFacts.length) lines.push("FACTS: " + c.chatbotFacts.map((f) => f.fact).join(" | "));
  return lines.join("\n");
}
