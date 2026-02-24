"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createMediaItem, listMediaItems, deleteMediaItem } from "@/lib/media-items";
import { getPosterUrl } from "@/lib/tmdb";
import { clearCached } from "@/lib/recommendation-cache";

/** Normalize release_date for DB: only valid ISO-style dates or null (e.g. "Unreleased" → null). */
function parseReleaseDate(value: string | null): string | null {
  if (!value || !value.trim()) return null;
  const s = value.trim();
  const lower = s.toLowerCase();
  if (lower === "unreleased" || lower === "tba" || lower === "tbd") return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  const iso = d.toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  return iso;
}

export async function addFromTMDBAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const tmdbId = formData.get("tmdb_id");
  const tmdbType = formData.get("tmdb_type"); // "movie" | "tv"
  if (tmdbId == null || tmdbId === "") return;

  const isTV = tmdbType === "tv";
  const endpoint = isTV
    ? `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${process.env.TMDB_API_KEY}`
    : `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${process.env.TMDB_API_KEY}`;

  const res = await fetch(endpoint, { next: { revalidate: 3600 } });
  if (!res.ok) return;

  const data = await res.json();
  const title = data.title ?? data.name ?? "Unknown";
  const poster = getPosterUrl(data.poster_path ?? null);
  const voteAverage = Number(data.vote_average);
  const rating =
    Number.isFinite(voteAverage) && voteAverage >= 0
      ? Math.min(10, Math.max(1, Math.round(voteAverage)))
      : null;

  const genres = (data.genres as { name?: string }[] | undefined)?.map((g) => g.name).filter(Boolean) ?? [];
  const year = data.release_date?.split("-")[0] ?? data.first_air_date?.split("-")[0] ?? "";
  const tags = [...genres, year].filter(Boolean) as string[];

  const type = isTV ? "tv" : "movie";
  const releaseDate =
    data.release_date ||
    data.first_air_date ||
    null;

  let director = "";
  const creditsRes = await fetch(
    `https://api.themoviedb.org/3/${type}/${tmdbId}/credits?api_key=${process.env.TMDB_API_KEY}`,
    { next: { revalidate: 3600 } },
  );
  if (creditsRes.ok) {
    const credits = (await creditsRes.json()) as {
      crew?: { job?: string; name?: string }[];
      cast?: { name?: string }[];
    };
    director =
      credits.crew?.find((c) => c.job === "Director")?.name ||
      credits.cast?.[0]?.name ||
      "";
  }

  const creator = director.trim();

  await createMediaItem(supabase, user.id, {
    title,
    media_type: isTV ? "series" : "movie",
    status: "wishlist",
    rating: rating ?? null,
    image_url: poster ?? null,
    description: data.overview?.trim() ?? "",
    review: "",
    creator: creator || "",
    release_date: releaseDate,
    genre: genres.length ? genres.join(", ") : null,
    tags: tags.length ? tags : null,
  });

  clearCached(user.id);
  revalidatePath("/library");
  revalidatePath("/explore");
}

export async function addFromRecommendationAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    revalidatePath("/library");
    redirect("/library");
  }

  const title = (formData.get("title") as string)?.trim();
  const type = (formData.get("type") as string)?.trim() || "movie";
  const description = (formData.get("description") as string)?.trim() ?? "";
  const creator = (formData.get("creator") as string)?.trim() || null;
  const rawRelease = (formData.get("release_date") as string)?.trim() || null;
  const releaseDate = parseReleaseDate(rawRelease);
  const posterPath = (formData.get("poster_path") as string)?.trim() || null;

  if (!title) {
    revalidatePath("/explore");
    redirect("/explore");
  }

  const mediaType =
    type === "tv" || type === "series"
      ? "series"
      : type === "game"
        ? "game"
        : type === "music"
          ? "music"
          : "movie";
  const imageUrl = posterPath
    ? posterPath.startsWith("http")
      ? posterPath
      : getPosterUrl(posterPath)
    : null;

  await createMediaItem(supabase, user.id, {
    title,
    media_type: mediaType,
    status: "wishlist",
    rating: null,
    image_url: imageUrl,
    description: description || null,
    review: "",
    creator: creator ?? "",
    release_date: releaseDate,
    genre: null,
    tags: null,
  });

  clearCached(user.id);
  revalidatePath("/library");
  revalidatePath("/explore");
}

/** Remove from library by title + type (for Explore "Remove From Library"). */
export async function removeFromLibraryAction(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const title = (formData.get("title") as string)?.trim();
  const type = (formData.get("type") as string)?.trim() || "movie";
  if (!title) return { error: "Missing title" };

  const mediaType =
    type === "tv" || type === "series"
      ? "series"
      : type === "game"
        ? "game"
        : type === "music"
          ? "music"
          : "movie";

  const all = await listMediaItems(supabase, user.id, {});
  const normalized = title.trim().toLowerCase();
  const match = all.find(
    (item) =>
      (item.title ?? "").trim().toLowerCase() === normalized &&
      (item.media_type ?? "").toLowerCase() === mediaType.toLowerCase()
  );
  if (!match) return { error: "Item not found in library" };

  await deleteMediaItem(supabase, user.id, match.id);
  clearCached(user.id);
  revalidatePath("/library");
  revalidatePath("/explore");
  return {};
}
