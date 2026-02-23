import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/supabase/server";
import { ensureProfile, getProfileForUser } from "@/lib/profile";
import { getTrendingMovies, getTrendingTV } from "@/lib/tmdb";
import { fetchTrendingGames, fetchTrendingMusic } from "@/lib/trending";
import { listMediaItems } from "@/lib/media-items";
import { getSuggestedForUser } from "./suggested-actions";
import { ExploreContent } from "./explore-content";

export const dynamic = "force-dynamic";

function normalizeTitle(title: string | null | undefined): string {
  return (title ?? "").trim().toLowerCase();
}

export default async function ExplorePage() {
  const { user, supabase } = await getServerUser();

  if (!user) redirect("/login");

  await ensureProfile(supabase, user);
  const profile = await getProfileForUser(supabase, user.id);
  if (!profile) redirect("/login");

  const [suggested, moviesRes, tvRes, trendingGames, trendingMusic, allLibrary] =
    await Promise.all([
      getSuggestedForUser(),
      getTrendingMovies(),
      getTrendingTV(),
      fetchTrendingGames(),
      fetchTrendingMusic(),
      listMediaItems(supabase, user.id),
    ]);
  const movies = moviesRes.results ?? [];
  const tv = tvRes.results ?? [];
  const libraryTitles = new Set(
    allLibrary.map((i) => normalizeTitle(i.title)).filter(Boolean),
  );

  return (
    <ExploreContent
      user={user}
      profile={profile}
      suggested={suggested}
      movies={movies}
      tv={tv}
      trendingGames={trendingGames}
      trendingMusic={trendingMusic}
      libraryTitles={libraryTitles}
    />
  );
}
