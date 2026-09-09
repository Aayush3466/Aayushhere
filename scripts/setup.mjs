/**
 * THE CARTOGRAPHER — ONE-SHOT BACKEND SETUP
 * =========================================
 *   node scripts/setup.mjs [--password "…"] [--email "…"] [--force-seed]
 *
 * Idempotent. Run it as often as you like. It will:
 *   1. verify every table from supabase/schema.sql exists,
 *   2. create the single admin user (or reset its password),
 *   3. enrol that user in `admins` — the row that grants write access,
 *   4. seed the content tables from the CV seed, but only where they are EMPTY,
 *      so re-running can never overwrite edits made in the Studio.
 *
 * The service-role key is read from .env.local and never leaves this process.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* ------------------------------- environment ------------------------------ */

function loadEnv() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) die("No .env.local found. Copy .env.example and fill in your Supabase keys.");
  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnv();
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL_ || !SERVICE) die("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set in .env.local");

/* ---------------------------------- args ---------------------------------- */

const argv = process.argv.slice(2);
const arg = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const EMAIL = arg("email") || env.STUDIO_ADMIN_EMAIL || "ayushadhikari3466@gmail.com";
const FORCE_SEED = argv.includes("--force-seed");

/** A generated password is shown exactly once, then only ever lives in Supabase. */
let password = arg("password") || env.STUDIO_ADMIN_PASSWORD || "";
let generated = false;
if (!password) {
  password = crypto.randomBytes(15).toString("base64url");
  generated = true;
}

/* --------------------------------- helpers -------------------------------- */

function die(msg) {
  console.error(`\n  ✗ ${msg}\n`);
  process.exit(1);
}
const ok = (m) => console.log(`  ✓ ${m}`);
const info = (m) => console.log(`    ${m}`);

async function api(pathname, { method = "GET", body, headers = {}, prefer } = {}) {
  const res = await fetch(`${URL_}${pathname}`, {
    method,
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, okay: res.ok, data };
}

/* ------------------------------- 1. schema -------------------------------- */

const TABLES = [
  "admins", "profile", "publications", "projects", "experience",
  "education", "gallery", "chatbot_facts", "site_sections", "scores", "messages",
];

async function checkSchema() {
  console.log("\n[1/4] Schema");
  const missing = [];
  for (const t of TABLES) {
    const r = await api(`/rest/v1/${t}?select=*&limit=0`);
    if (r.status === 404 || (r.data && r.data.code === "42P01")) missing.push(t);
    else if (!r.okay) die(`Checking table "${t}" failed (HTTP ${r.status}): ${JSON.stringify(r.data)}`);
  }
  if (missing.length) {
    console.error(`\n  ✗ Missing ${missing.length} table(s): ${missing.join(", ")}`);
    console.error(`
    DDL cannot be run with an API key, so this one step is manual:

      1. open  ${URL_.replace(/^https:\/\/([^.]+)\..*/, "https://supabase.com/dashboard/project/$1/sql/new")}
      2. paste the whole of  supabase/schema.sql
      3. press Run, then re-run:  npm run setup
`);
    process.exit(1);
  }
  ok(`all ${TABLES.length} tables present`);
}

/* -------------------------------- 2. admin -------------------------------- */

async function ensureAdmin() {
  console.log("\n[2/4] Admin account");

  // The Admin API has no "get by email", so page through until we find them.
  let user = null;
  for (let page = 1; page <= 20 && !user; page++) {
    const r = await api(`/auth/v1/admin/users?page=${page}&per_page=200`);
    if (!r.okay) die(`Listing users failed (HTTP ${r.status}): ${JSON.stringify(r.data)}`);
    const users = r.data?.users ?? [];
    user = users.find((u) => (u.email || "").toLowerCase() === EMAIL.toLowerCase()) || null;
    if (users.length < 200) break;
  }

  if (user) {
    const r = await api(`/auth/v1/admin/users/${user.id}`, {
      method: "PUT",
      body: { password, email_confirm: true },
    });
    if (!r.okay) die(`Resetting the password failed (HTTP ${r.status}): ${JSON.stringify(r.data)}`);
    ok(`password reset for ${EMAIL}`);
  } else {
    const r = await api(`/auth/v1/admin/users`, {
      method: "POST",
      body: { email: EMAIL, password, email_confirm: true },
    });
    if (!r.okay) die(`Creating the admin failed (HTTP ${r.status}): ${JSON.stringify(r.data)}`);
    user = r.data;
    ok(`created ${EMAIL}`);
  }

  const enrol = await api(`/rest/v1/admins`, {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: { user_id: user.id, email: EMAIL },
  });
  if (!enrol.okay) die(`Enrolling in admins failed (HTTP ${enrol.status}): ${JSON.stringify(enrol.data)}`);
  ok("enrolled in admins (write access granted)");

  return user;
}

/* -------------------------------- 3. seed --------------------------------- */

async function count(table) {
  const res = await fetch(`${URL_}/rest/v1/${table}?select=*&limit=1`, {
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: "count=exact", Range: "0-0" },
  });
  const cr = res.headers.get("content-range") || "";
  return Number(cr.split("/")[1] || 0);
}

async function upsert(table, rows) {
  if (!rows.length) return;
  const r = await api(`/rest/v1/${table}`, {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: rows,
  });
  if (!r.okay) die(`Seeding "${table}" failed (HTTP ${r.status}): ${JSON.stringify(r.data)}`);
}

async function seed() {
  console.log("\n[3/4] Content");

  const { SEED } = await import(new URL("../src/data/seed.ts", import.meta.url));
  const { SECTIONS } = await import(new URL("../src/lib/sections.ts", import.meta.url));

  const n = (v, i) => (typeof v === "number" ? v : i + 1);

  const plan = [
    ["profile", () => [{
      id: 1,
      name: SEED.profile.name,
      tagline: SEED.profile.tagline,
      short_bio: SEED.profile.shortBio,
      location: SEED.profile.location,
      email: SEED.profile.email,
      cv_file_url: SEED.profile.cvFileUrl || null,
      avatar: SEED.profile.avatar || null,
      socials: SEED.profile.socials ?? [],
      skills: SEED.profile.skills ?? [],
    }]],
    ["publications", () => SEED.publications.map((p, i) => ({
      id: p.id, title: p.title, venue: p.venue ?? null, status: p.status ?? null,
      date: p.date ?? null, authors: p.authors ?? [], abstract: p.abstract ?? null,
      region: p.region, links: p.links ?? [], result_images: p.resultImages ?? [],
      sort_order: n(p.order, i),
    }))],
    ["projects", () => SEED.projects.map((p, i) => ({
      id: p.id, title: p.title, type: p.type, summary: p.summary ?? null,
      description: p.description ?? null, date: p.date ?? null, tech: p.tech ?? [],
      live_url: p.liveUrl ?? null, repo_url: p.repoUrl ?? null,
      preview_image: p.previewImage ?? null, preview_source: p.previewSource ?? null,
      region: p.region, sort_order: n(p.order, i),
    }))],
    ["experience", () => SEED.experience.map((e, i) => ({
      id: e.id, role: e.role, org: e.org, start_date: e.startDate ?? null,
      end_date: e.endDate ?? null, ongoing: !!e.ongoing, summary: e.summary ?? null,
      links: e.links ?? [], sort_order: n(e.order, i),
    }))],
    ["education", () => SEED.education.map((e, i) => ({
      id: e.id, degree: e.degree, institution: e.institution, location: e.location ?? null,
      dates: e.dates ?? null, detail: e.detail ?? null, links: e.links ?? [],
      sort_order: n(e.order, i),
    }))],
    ["gallery", () => SEED.gallery.map((g, i) => ({
      id: g.id, image_url: g.imageUrl, caption: g.caption ?? null,
      tags: g.tags ?? [], sort_order: n(g.order, i),
    }))],
    ["chatbot_facts", () => SEED.chatbotFacts.map((f, i) => ({
      id: f.id, fact: f.fact, sort_order: i + 1,
    }))],
    ["site_sections", () => SECTIONS.map((s, i) => ({
      id: s.id, nav: s.nav, eyebrow: s.eyebrow, title: s.title,
      subtitle: s.subtitle, accent: s.accent, sort_order: i + 1,
    }))],
  ];

  for (const [table, build] of plan) {
    const existing = await count(table);
    if (existing > 0 && !FORCE_SEED) {
      info(`${table}: ${existing} row(s) already there — left untouched`);
      continue;
    }
    const rows = build();
    await upsert(table, rows);
    ok(`${table}: seeded ${rows.length} row(s)`);
  }

  if (!FORCE_SEED) info("(use --force-seed to overwrite existing rows with the CV seed)");
}

/* ------------------------------- 4. verify -------------------------------- */

async function verify() {
  console.log("\n[4/4] Verification");

  // Sign in exactly as the browser will, using the publishable key.
  const signIn = await fetch(`${URL_}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password }),
  });
  const session = await signIn.json();
  if (!signIn.ok || !session.access_token) die(`Admin sign-in failed (HTTP ${signIn.status}): ${JSON.stringify(session)}`);
  ok("admin can sign in with the publishable key");

  const asAdmin = (p, init = {}) =>
    fetch(`${URL_}${p}`, {
      ...init,
      headers: {
        apikey: ANON,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    });

  const amAdmin = await asAdmin(`/rest/v1/rpc/is_admin`, { method: "POST", body: "{}" });
  const isAdmin = await amAdmin.json();
  if (isAdmin !== true) die(`is_admin() returned ${JSON.stringify(isAdmin)} — the admins row is missing.`);
  ok("is_admin() is true for the signed-in admin");

  // The security property that matters: a logged-out visitor may read, never write.
  const anonWrite = await fetch(`${URL_}/rest/v1/profile?id=eq.1`, {
    method: "PATCH",
    headers: { apikey: ANON, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ tagline: "anonymous tamper attempt" }),
  });
  const body = await anonWrite.json().catch(() => null);
  const blocked = anonWrite.status === 401 || anonWrite.status === 403 ||
    (anonWrite.status === 200 && Array.isArray(body) && body.length === 0);
  if (!blocked) die(`RLS HOLE: an anonymous PATCH of profile returned HTTP ${anonWrite.status} ${JSON.stringify(body)}`);
  ok(`anonymous writes are refused by RLS (HTTP ${anonWrite.status})`);

  const anonRead = await fetch(`${URL_}/rest/v1/profile?select=name&id=eq.1`, { headers: { apikey: ANON } });
  if (!anonRead.ok) die(`Public read failed (HTTP ${anonRead.status}) — the site would fall back to the seed.`);
  ok("public reads work (the map will render live data)");
}

/* ---------------------------------- main ---------------------------------- */

console.log(`\n  THE CARTOGRAPHER — backend setup\n  ${URL_}`);
await checkSchema();
await ensureAdmin();
await seed();
await verify();

console.log(`\n  ────────────────────────────────────────────────────────────
  Studio is live at /studio

    email     ${EMAIL}
    password  ${generated ? password : "(the one you supplied)"}
`);
if (generated) {
  console.log(`  This generated password is shown ONCE and is not stored anywhere
  on disk. Save it now, then change it any time from Studio → Account,
  or in Supabase → Authentication → Users.
`);
}
console.log(`  ────────────────────────────────────────────────────────────\n`);
