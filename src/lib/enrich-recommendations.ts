import { getPosterUrl } from "@/lib/tmdb";
import type { Recommendation } from "@/app/dashboard/ai-recommendations-actions";
import type { MediaType } from "@/types/media";

const TMDB_BASE = "https://api.themoviedb.org/3";
const apiKey = () => process.env.TMDB_API_KEY ?? "";

export type EnrichedRecommendation = {
  id: string;
  title: string;
  type: MediaType;
  description: string | null;
  creator: string | null;
  release_date: string | null;
  poster_path: string | null;
  reason: string;
  rating?: number | null;
};

type SearchResult = {
  id: number;
  title?: string;
  name?: string;
  overview?: string | null;
  poster_path?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
};

type CreditsResult = {
  crew?: { job?: string; name?: string }[];
  cast?: { name?: string }[];
};

async function searchTMDB(title: string, type: "movie" | "series"): Promise<SearchResult | null> {
  const endpoint = type === "movie"
    ? `${TMDB_BASE}/search/movie?query=${encodeURIComponent(title)}&api_key=${apiKey()}`
    : `${TMDB_BASE}/search/tv?query=${encodeURIComponent(title)}&api_key=${apiKey()}`;
  const res = await fetch(endpoint, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = (await res.json()) as { results?: SearchResult[] };
  const first = data.results?.[0];
  return first ?? null;
}

async function getCredits(tmdbId: number, type: "movie" | "series"): Promise<string | null> {
  const path = type === "movie" ? "movie" : "tv";
  const res = await fetch(
    `${TMDB_BASE}/${path}/${tmdbId}/credits?api_key=${apiKey()}`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return null;
  const credits = (await res.json()) as CreditsResult;
  const director =
    credits.crew?.find((c) => c.job === "Director")?.name ??
    credits.crew?.find((c) => c.job === "Creator")?.name ??
    credits.cast?.[0]?.name ??
    null;
  return director ?? null;
}

export async function enrichRecommendation(
  rec: Recommendation,
  index: number,
): Promise<EnrichedRecommendation> {
  const id = `rec-${index}-${encodeURIComponent(rec.title)}-${rec.media_type}`;
  const type: "movie" | "series" =
    rec.media_type === "movie" || rec.media_type === "series" ? rec.media_type : "movie";

  if (rec.media_type === "movie" || rec.media_type === "series") {
    const hit = await searchTMDB(rec.title, type);
    if (hit) {
      const creator = await getCredits(hit.id, type);
      const release_date =
        hit.release_date ?? hit.first_air_date ?? null;
      return {
        id: String(hit.id),
        title: rec.title,
        type,
        description: (hit.overview ?? "").trim() || rec.why,
        creator,
        release_date,
        poster_path: hit.poster_path ?? null,
        reason: rec.why,
      };
    }
  }

  if (rec.media_type === "game") {
    return {
      id: `rec-${index}-${encodeURIComponent(rec.title)}-game`,
      title: rec.title,
      type: "game",
      description: rec.why,
      creator: null,
      release_date: null,
      poster_path: null,
      reason: rec.why,
    };
  }

  if (rec.media_type === "music") {
    const album = await fetchMusicFromiTunes(rec.title);
    if (album) {
      return {
        id: album.id,
        title: album.title,
        type: "music",
        description: album.description,
        creator: album.creator,
        release_date: album.release_date,
        poster_path: album.poster_path,
        reason: rec.why,
      };
    }
  }

  const fallbackType: EnrichedRecommendation["type"] =
    rec.media_type as EnrichedRecommendation["type"];
  return {
    id,
    title: rec.title,
    type: fallbackType,
    description: rec.why,
    creator: null,
    release_date: null,
    poster_path: null,
    reason: rec.why,
  };
}

type MusicHit = {
  id: string;
  title: string;
  description: string | null;
  creator: string | null;
  release_date: string | null;
  poster_path: string | null;
};

async function fetchMusicFromiTunes(query: string): Promise<MusicHit | null> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=5`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: { collectionId: number; collectionName?: string; artistName?: string; releaseDate?: string; primaryGenreName?: string; artworkUrl100?: string }[] };
    const first = data.results?.[0];
    if (!first) return null;
    return {
      id: String(first.collectionId),
      title: first.collectionName ?? query,
      description: first.primaryGenreName ?? null,
      creator: first.artistName ?? null,
      release_date: first.releaseDate ?? null,
      poster_path: first.artworkUrl100 ?? null,
    };
  } catch {
    return null;
  }
}

export function getPosterUrlForRecommendation(posterPath: string | null): string | null {
  return getPosterUrl(posterPath);
}
