import type { SupabaseClient } from "@supabase/supabase-js";

/** Private bucket for poster images. Created by supabase/migrations/0002_storage_media_posters.sql */
const BUCKET = "media-posters";

/** Prefix stored in DB for poster paths (image_url). Use with path only; never store signed URLs. */
export const STORAGE_PATH_PREFIX = "media-posters:";

/**
 * Upload a poster file to Supabase Storage (bucket: media-posters).
 * Path: {userId}/{uuid}-{fileName}
 * Returns path (for DB) and optional signedUrl for immediate preview (expires in 1h).
 */
export async function uploadPoster(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<{ path: string; signedUrl: string | null }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 80);
  const path = `${userId}/${crypto.randomUUID()}-${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || "image/jpeg",
  });

  if (error) throw error;

  const { data, error: signedError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600);

  if (signedError) {
    return { path, signedUrl: null };
  }

  return { path, signedUrl: data?.signedUrl ?? null };
}

/**
 * Get a signed URL for a poster path (bucket: media-posters).
 * Use when rendering; do not store the result in DB.
 */
export async function getPosterSignedUrl(
  supabase: SupabaseClient,
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) {
    return null;
  }

  return data?.signedUrl ?? null;
}
