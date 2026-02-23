export type TrendingGame = {
  id: string;
  title: string;
  type: "game";
  genre: string[];
  developers: string[];
  publishers: string[];
  releaseDates: Record<string, string> | null;
  description: string | null;
  poster_path: string | null;
};

export type TrendingMusic = {
  id: string;
  title: string;
  type: "music";
  creator: string | null;
  release_date: string | null;
  description: string | null;
  poster_path: string | null;
};

export async function fetchTrendingGames(): Promise<TrendingGame[]> {
  try {
    const res = await fetch(
      "https://api.sampleapis.com/switch/games",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];

    const data = (await res.json()) as Array<{
      id?: number;
      name?: string;
      developer?: string;
      developers?: string[];
      publishers?: string[];
      genre?: string[];
      releaseDate?: string | null;
      releaseDates?: Record<string, string> | null;
      description?: string | null;
      thumbnail?: string | null;
    }>;

    return (Array.isArray(data) ? data.slice(0, 12) : []).map((game, index) => ({
      id: String(game.id ?? index),
      title: game.name ?? "Unknown Game",
      type: "game" as const,
      genre: Array.isArray(game.genre) ? game.genre : [],
      developers: Array.isArray(game.developers)
        ? game.developers
        : game.developer
          ? [String(game.developer)]
          : [],
      publishers: Array.isArray(game.publishers) ? game.publishers : [],
      releaseDates: game.releaseDates ?? null,
      description: game.description ?? null,
      poster_path: game.thumbnail ?? null,
    }));
  } catch (e) {
    return [];
  }
}

export async function fetchTrendingMusic(): Promise<TrendingMusic[]> {
  try {
    const res = await fetch(
      "https://itunes.apple.com/search?term=top&entity=album&limit=8",
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      results?: {
        collectionId: number;
        collectionName?: string;
        artistName?: string;
        releaseDate?: string;
        primaryGenreName?: string;
        artworkUrl100?: string;
      }[];
    };
    const results = data.results ?? [];
    return results.map((item) => ({
      id: String(item.collectionId),
      title: item.collectionName ?? "Unknown",
      type: "music" as const,
      creator: item.artistName ?? null,
      release_date: item.releaseDate ?? null,
      description: item.primaryGenreName ?? null,
      poster_path: item.artworkUrl100 ?? null,
    }));
  } catch {
    return [];
  }
}
