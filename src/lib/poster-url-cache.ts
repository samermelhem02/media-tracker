import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "media-posters";
const BUFFER_MS = 60_000; // 1 min buffer before expiry

const cache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Returns a signed poster URL, reusing a cached URL when still valid
 * (within 1 min of expiry). Same path => same src across requests.
 */
export async function getCachedPosterUrl(
  supabase: SupabaseClient,
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  const entry = cache.get(path);
  const now = Date.now();
  if (entry && now < entry.expiresAt - BUFFER_MS) {
    return entry.url;
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) {
    return null;
  }

  const url = data?.signedUrl ?? null;
  if (url) {
    cache.set(path, {
      url,
      expiresAt: now + expiresIn * 1000,
    });
  }
  return url;
}
