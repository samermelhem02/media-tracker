import type { SupabaseClient } from "@supabase/supabase-js";
import type { MediaItem } from "./db-types";

export type MediaItemFilters = {
  status?: string;
  mediaType?: string;
  q?: string;
};

export type MediaItemInsert = {
  title: string;
  media_type: string;
  status: string;
  rating?: number | null;
  description?: string | null;
  review?: string | null;
  creator?: string | null;
  genre?: string | null;
  tags?: string[] | null;
  image_url?: string | null;
  release_date?: string | null;
};

export type MediaItemUpdate = Partial<
  Omit<MediaItemInsert, "title" | "description"> & { title?: string }
>;

export async function getMediaItem(
  supabase: SupabaseClient,
  userId: string,
  itemId: string,
): Promise<MediaItem | null> {
  const { data, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("id", itemId)
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data as MediaItem;
}

export async function listMediaItems(
  supabase: SupabaseClient,
  userId: string,
  filters?: MediaItemFilters,
): Promise<MediaItem[]> {
  let query = supabase
    .from("media_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters?.q?.trim()) {
    const q = filters.q.trim();
    query = query.or(`title.ilike.%${q}%,creator.ilike.%${q}%,genre.ilike.%${q}%`);
  }
  if (filters?.status?.trim()) {
    query = query.eq("status", filters.status.trim());
  }
  if (filters?.mediaType?.trim()) {
    query = query.eq("media_type", filters.mediaType.trim());
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as MediaItem[];
}

export async function createMediaItem(
  supabase: SupabaseClient,
  userId: string,
  data: MediaItemInsert,
): Promise<MediaItem> {
  const payload = {
    user_id: userId,
    title: data.title,
    media_type: data.media_type,
    status: data.status,
    rating: data.rating ?? null,
    image_url: data.image_url ?? null,
    description: data.description ?? "",
    review: data.review ?? "",
    creator: data.creator ?? "",
    release_date: data.release_date ?? null,
    genre: data.genre ?? null,
    tags: data.tags ?? [],
  };

  const { data: row, error } = await supabase
    .from("media_items")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return row as MediaItem;
}

export async function updateMediaItem(
  supabase: SupabaseClient,
  userId: string,
  itemId: string,
  data: MediaItemUpdate,
): Promise<MediaItem> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.title !== undefined) payload.title = data.title;
  if (data.media_type !== undefined) payload.media_type = data.media_type;
  if (data.status !== undefined) payload.status = data.status;
  if (data.rating !== undefined) payload.rating = data.rating;
  if (data.review !== undefined) payload.review = data.review;
  if (data.creator !== undefined) payload.creator = data.creator;
  if (data.genre !== undefined) payload.genre = data.genre;
  if (data.tags !== undefined) payload.tags = data.tags;
  if (data.image_url !== undefined) payload.image_url = data.image_url;
  if (data.release_date !== undefined) payload.release_date = data.release_date;

  const { data: row, error } = await supabase
    .from("media_items")
    .update(payload)
    .eq("id", itemId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return row as MediaItem;
}

export async function deleteMediaItem(
  supabase: SupabaseClient,
  userId: string,
  itemId: string,
): Promise<void> {
  const { error } = await supabase
    .from("media_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", userId);

  if (error) throw error;
}
