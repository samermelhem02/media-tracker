const TMDB_BASE = "https://api.themoviedb.org/3";

export type TMDBMedia = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
};

type TrendingResponse = { results: TMDBMedia[] };

async function tmdbFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(
    `${TMDB_BASE}${endpoint}&api_key=${process.env.TMDB_API_KEY}`,
    { next: { revalidate: 3600 } } // cache 1 hour
  );

  if (!res.ok) throw new Error("TMDB request failed");
  return res.json();
}

export async function getTrendingMovies(): Promise<TrendingResponse> {
  return tmdbFetch<TrendingResponse>("/trending/movie/week?");
}

export async function getTrendingTV(): Promise<TrendingResponse> {
  return tmdbFetch<TrendingResponse>("/trending/tv/week?");
}

export function getPosterUrl(path: string | null): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/w500${path}`;
}
