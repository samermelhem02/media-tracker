"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createMediaItem,
  updateMediaItem,
  deleteMediaItem,
} from "@/lib/media-items";
import { uploadPoster, STORAGE_PATH_PREFIX } from "@/lib/storage";
import { getCachedPosterUrl } from "@/lib/poster-url-cache";
import { clearCached } from "@/lib/recommendation-cache";
import { MEDIA_TYPES, MEDIA_STATUSES } from "@/lib/db-types";
import type { MediaItem } from "@/lib/db-types";

const mediaTypeEnum = z.enum(MEDIA_TYPES as unknown as [string, ...string[]]);
const statusEnum = z.enum(MEDIA_STATUSES as unknown as [string, ...string[]]);

const tagsTransform = z
  .string()
  .optional()
  .transform((s) => {
    if (!s?.trim()) return [];
    const arr = s
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    return [...new Set(arr)];
  });

const ratingTransform = z
  .string()
  .optional()
  .transform((s) => {
    if (s === undefined || s === "") return undefined;
    const n = parseInt(s, 10);
    return Number.isInteger(n) && n >= 1 && n <= 10 ? n : undefined;
  });

const titleSchema = z
  .string()
  .transform((s) => s.trim())
  .refine((s) => s.length >= 2, "Title must be at least 2 characters");

const imageUrlSchema = z
  .string()
  .optional()
  .transform((s) => s?.trim() || null);

const createSchema = z.object({
  title: titleSchema,
  media_type: mediaTypeEnum,
  status: statusEnum,
  rating: ratingTransform,
  description: z.string().optional().nullable(),
  review: z.string().optional().nullable(),
  creator: z.string().optional().nullable(),
  genre: z.string().optional().nullable(),
  tags: tagsTransform,
  image_url: z.string().optional().nullable(),
});

const updateSchema = z.object({
  itemId: z.string().uuid(),
  title: titleSchema.optional(),
  media_type: mediaTypeEnum.optional(),
  status: statusEnum.optional(),
  rating: ratingTransform,
  review: z.string().optional().transform((s) => s?.trim() || null),
  creator: z.string().optional().transform((s) => s?.trim() || null),
  genre: z.string().optional().transform((s) => s?.trim() || null),
  tags: tagsTransform.optional(),
  image_url: imageUrlSchema,
});

export type CreateResult = { error?: string; item?: MediaItem };
export type UpdateResult = { error?: string; item?: MediaItem };
export type DeleteResult = { error?: string; deletedId?: string };

export async function createMediaItemAction(
  formData: FormData,
): Promise<CreateResult> {
  const raw = {
    title: formData.get("title"),
    media_type: formData.get("media_type"),
    status: formData.get("status"),
    rating: formData.get("rating"),
    description: formData.get("description"),
    review: formData.get("review"),
    creator: formData.get("creator"),
    genre: formData.get("genre"),
    tags: formData.get("tags"),
    image_url: formData.get("image_url"),
  };
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((e) => e.message ?? "Invalid")
      .join("; ") || "Invalid input";
    return { error: msg };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const normalize = (v: unknown): string | null =>
    typeof v === "string" && v.trim() === "" ? null : typeof v === "string" ? v : null;

  let imageUrl: string | null;
  const file = formData.get("poster_file") as File | null;
  if (file && file.size > 0) {
    try {
      const result = await uploadPoster(supabase, user.id, file);
      imageUrl = `${STORAGE_PATH_PREFIX}${result.path}`;
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to upload poster" };
    }
  } else {
    imageUrl = normalize(parsed.data.image_url) ?? null;
  }

  const description = (formData.get("description") as string) || "";
  const review = (formData.get("review") as string) || "";
  const creator = normalize(parsed.data.creator);
  const genre = normalize(parsed.data.genre);
  const imageUrlNormalized = imageUrl;

  const insertPayload = {
    title: parsed.data.title,
    media_type: parsed.data.media_type,
    status: parsed.data.status,
    rating: parsed.data.rating ?? null,
    review,
    genre,
    tags: parsed.data.tags.length ? parsed.data.tags : null,
    image_url: imageUrlNormalized,
    user_id: user?.id,
  };

  try {
    const item = await createMediaItem(supabase, user.id, {
      title: parsed.data.title,
      media_type: parsed.data.media_type,
      status: parsed.data.status,
      rating: parsed.data.rating ?? null,
      description,
      review,
      creator,
      genre,
      tags: parsed.data.tags.length ? parsed.data.tags : null,
      image_url: imageUrlNormalized,
    });
    clearCached(user.id);
    revalidatePath("/library");
    let out: MediaItem & { posterUrl?: string | null } = item;
    if (item.image_url?.startsWith(STORAGE_PATH_PREFIX)) {
      const path = item.image_url.slice(STORAGE_PATH_PREFIX.length);
      const posterUrl = await getCachedPosterUrl(supabase, path, 3600);
      out = { ...item, posterUrl: posterUrl ?? null };
    }
    return { item: out };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create" };
  }
}

export async function updateMediaItemAction(
  _prevState: UpdateResult | void,
  formData: FormData,
): Promise<UpdateResult> {
  const raw = {
    itemId: formData.get("itemId"),
    title: formData.get("title"),
    media_type: formData.get("media_type"),
    status: formData.get("status"),
    rating: formData.get("rating"),
    review: formData.get("review"),
    creator: formData.get("creator"),
    genre: formData.get("genre"),
    tags: formData.get("tags"),
    image_url: formData.get("image_url"),
  };
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((e) => e.message ?? "Invalid")
      .join("; ") || "Invalid input";
    return { error: msg };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const removePoster = formData.get("remove_poster") === "true";
  const { itemId, ...rest } = parsed.data;
  const data: Record<string, unknown> = {};
  if (rest.title !== undefined) data.title = rest.title;
  if (rest.media_type !== undefined) data.media_type = rest.media_type;
  if (rest.status !== undefined) data.status = rest.status;
  if (rest.rating !== undefined) data.rating = rest.rating;
  if (rest.review !== undefined) data.review = rest.review;
  if (rest.creator !== undefined) data.creator = rest.creator;
  if (rest.genre !== undefined) data.genre = rest.genre;
  if (rest.tags !== undefined) data.tags = rest.tags.length ? rest.tags : [];

  const file = formData.get("poster_file") as File | null;

  if (removePoster) {
    const { data: existing } = await supabase
      .from("media_items")
      .select("image_url")
      .eq("id", itemId)
      .eq("user_id", user.id)
      .single();
    const existingImageUrl = (existing as { image_url?: string | null } | null)?.image_url;
    if (existingImageUrl?.startsWith(STORAGE_PATH_PREFIX)) {
      const path = existingImageUrl.slice(STORAGE_PATH_PREFIX.length);
      await supabase.storage.from("media-posters").remove([path]);
    }
    data.image_url = null;
  } else if (file && file.size > 0) {
    try {
      const result = await uploadPoster(supabase, user.id, file);
      data.image_url = `${STORAGE_PATH_PREFIX}${result.path}`;
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to upload poster" };
    }
  } else if (rest.image_url !== undefined && rest.image_url !== null && String(rest.image_url).trim() !== "") {
    data.image_url = rest.image_url.trim() || null;
  }

  const updatePayload = {
    title: data.title,
    media_type: data.media_type,
    status: data.status,
    rating: data.rating,
    review: data.review,
    genre: data.genre,
    tags: data.tags,
    image_url: data.image_url,
  };

  try {
    const item = await updateMediaItem(supabase, user.id, itemId, data);
    clearCached(user.id);
    revalidatePath("/library");
    let out: MediaItem & { posterUrl?: string | null } = item;
    if (item.image_url?.startsWith(STORAGE_PATH_PREFIX)) {
      const path = item.image_url.slice(STORAGE_PATH_PREFIX.length);
      const posterUrl = await getCachedPosterUrl(supabase, path, 3600);
      out = { ...item, posterUrl: posterUrl ?? null };
    }
    return { item: out };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update" };
  }
}

export async function deleteMediaItemAction(
  formData: FormData,
): Promise<DeleteResult> {
  const itemId = formData.get("itemId");
  if (typeof itemId !== "string" || !itemId) return { error: "Missing item" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    await deleteMediaItem(supabase, user.id, itemId);
    clearCached(user.id);
    revalidatePath("/library");
    return { deletedId: itemId };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to delete" };
  }
}
