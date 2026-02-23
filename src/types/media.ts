/**
 * Centralized media types for Explore, cards, and API responses.
 * For DB-backed library items, see @/lib/db-types (MediaItem with media_type).
 */

export type MediaType = "movie" | "series" | "music" | "game";

export interface MediaItem {
  id: number | string;
  title: string;
  type: MediaType;
  poster_path?: string | null;
  rating?: number | null;
  status?: string;
  genre?: string[];
  developers?: string[];
  publishers?: string[];
  releaseDates?: Record<string, string>;
  description?: string | null;
}
