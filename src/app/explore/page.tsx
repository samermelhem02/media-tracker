import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile, getProfileForUser } from "@/lib/profile";
import { getTrendingMovies, getTrendingTV } from "@/lib/tmdb";
import { fetchTrendingGames, fetchTrendingMusic } from "@/lib/trending";
import { getSuggestedForUser } from "./suggested-actions";
import { ExploreContent } from "./explore-content";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await ensureProfile(supabase, user);
  const profile = await getProfileForUser(supabase, user.id);
  if (!profile) redirect("/login");

  const [suggested, moviesRes, tvRes, trendingGames, trendingMusic] =
    await Promise.all([
      getSuggestedForUser(),
      getTrendingMovies(),
      getTrendingTV(),
      fetchTrendingGames(),
      fetchTrendingMusic(),
    ]);
  const movies = moviesRes.results ?? [];
  const tv = tvRes.results ?? [];

  return (
    <ExploreContent
      user={user}
      suggested={suggested}
      movies={movies}
      tv={tv}
      trendingGames={trendingGames}
      trendingMusic={trendingMusic}
    />
  );
}
