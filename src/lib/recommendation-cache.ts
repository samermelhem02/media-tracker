import type { EnrichedRecommendation } from "@/lib/enrich-recommendations";

export type CachedSuggestions = {
  fingerprint: string;
  createdAt: number;
  suggestions: EnrichedRecommendation[];
};

const store = new Map<string, CachedSuggestions>();

export function getCached(userId: string): CachedSuggestions | null {
  return store.get(userId) ?? null;
}

export function setCached(userId: string, value: CachedSuggestions): void {
  store.set(userId, value);
}

export function clearCached(userId: string): void {
  store.delete(userId);
}

const DEFAULT_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export function isFresh(
  createdAt: number,
  ttlMs: number = DEFAULT_TTL_MS,
): boolean {
  return Date.now() - createdAt < ttlMs;
}
