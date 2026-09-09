"use client";

import { getBrowserSupabase } from "./client";

/**
 * Uploads go BROWSER → SUPABASE STORAGE directly, never through a server action.
 * Server actions carry a request-body limit measured in single-digit megabytes,
 * and routing a 10MB scan of a poster through one would fail in a way that looks
 * like a bug rather than a limit. Storage RLS still requires an admin session,
 * so this is no less protected than a server route.
 */

const BUCKET = "media";

/** Ceiling that matches what the gallery can sensibly display. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export interface UploadResult {
  ok: boolean;
  url?: string;
  error?: string;
}

/** `A Photo (final)2.PNG` → `a-photo-final-2.png`, so URLs stay clean. */
function safeName(name: string): string {
  const dot = name.lastIndexOf(".");
  const ext = (dot > 0 ? name.slice(dot + 1) : "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "file";
  const stamp = Date.now().toString(36);
  return ext ? `${base}-${stamp}.${ext}` : `${base}-${stamp}`;
}

export async function uploadMedia(file: File, folder = "uploads"): Promise<UploadResult> {
  const db = getBrowserSupabase();
  if (!db) return { ok: false, error: "No backend configured — upload unavailable." };

  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is ${
        MAX_UPLOAD_BYTES / 1024 / 1024
      }MB.`,
    };
  }

  const path = `${folder}/${safeName(file.name)}`;
  const { error } = await db.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) return { ok: false, error: error.message };

  const { data } = db.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
