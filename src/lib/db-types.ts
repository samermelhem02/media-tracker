/**
 * Minimal TypeScript shapes for app use. Not full Supabase generated types.
 * Matches existing DB: profiles, media_items.
 */

export type Profile = {
  id: string;
  username: string;
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  is_public?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export const MEDIA_TYPES = ["movie", "series", "music", "game"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const MEDIA_STATUSES = [
  "owned",
  "wishlist",
  "watching",
  "completed",
] as const;
export type MediaStatus = (typeof MEDIA_STATUSES)[number];

export type MediaItem = {
  id: string;
  user_id: string;
  title: string;
  media_type: MediaType;
  status: MediaStatus;
  rating?: number | null;
  description?: string | null;
  review?: string | null;
  creator?: string | null;
  genre?: string | null;
  tags?: string[] | null;
  image_url?: string | null;
  release_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};
