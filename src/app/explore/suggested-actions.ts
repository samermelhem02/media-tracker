"use server";

import { createClient } from "@/lib/supabase/server";
import { listMediaItems } from "@/lib/media-items";
import { buildLibraryFingerprint } from "@/lib/library-fingerprint";
import {
  getCached,
  setCached,
  isFresh,
} from "@/lib/recommendation-cache";
import type { EnrichedRecommendation } from "@/lib/enrich-recommendations";
import { enrichRecommendation } from "@/lib/enrich-recommendations";
import { generateRecommendationsAction } from "@/app/dashboard/ai-recommendations-actions";

export async function getSuggestedForUser(): Promise<EnrichedRecommendation[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const items = await listMediaItems(supabase, user.id);
  const fingerprint = buildLibraryFingerprint(
    items.map((item) => ({
      id: item.id,
      title: item.title ?? null,
      media_type: item.media_type ?? null,
      creator: item.creator ?? null,
      release_date: item.release_date ?? null,
      status: item.status ?? null,
    })),
  );

  const cached = getCached(user.id);
  if (
    cached &&
    cached.fingerprint === fingerprint &&
    isFresh(cached.createdAt)
  ) {
    return cached.suggestions;
  }

  const result = await generateRecommendationsAction();
  const raw = result.recommendations ?? [];
  if (raw.length === 0) return [];

  const suggestions: EnrichedRecommendation[] = await Promise.all(
    raw.map((rec, i) => enrichRecommendation(rec, i)),
  );

  setCached(user.id, {
    fingerprint,
    createdAt: Date.now(),
    suggestions,
  });

  return suggestions;
}
