"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/dashboard/top-nav";
import { RecommendationsTabs } from "@/components/recommendations/recommendations-tabs";
import { SuggestedGrid } from "@/components/recommendations/suggested-grid";
import ExploreMediaModal, {
  type ExploreMediaItem,
} from "@/components/ExploreMediaModal";
import type { User } from "@supabase/supabase-js";
import type { TMDBMedia } from "@/lib/tmdb";
import type { TrendingMusic, TrendingGame } from "@/lib/trending";
import type { EnrichedRecommendation } from "@/lib/enrich-recommendations";
import {
  addFromTMDBAction,
  addFromRecommendationAction,
} from "@/app/explore/actions";

type ExploreContentProps = {
  user: User;
  suggested: EnrichedRecommendation[];
  movies: TMDBMedia[];
  tv: TMDBMedia[];
  trendingGames: TrendingGame[];
  trendingMusic: TrendingMusic[];
};

export function ExploreContent({
  user,
  suggested,
  movies,
  tv,
  trendingGames,
  trendingMusic,
}: ExploreContentProps) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<ExploreMediaItem | null>(null);

  const handleAddToLibrary = (item: ExploreMediaItem) => {
    if (item.tmdbId != null && item.tmdbType) {
      const formData = new FormData();
      formData.set("tmdb_id", String(item.tmdbId));
      formData.set("tmdb_type", item.tmdbType);
      addFromTMDBAction(formData).then(() => router.refresh());
    } else {
      const formData = new FormData();
      formData.set("title", item.title);
      formData.set("type", item.type);
      formData.set("description", item.description ?? "");
      formData.set(
        "creator",
        item.creator ?? item.developers?.join(", ") ?? ""
      );
      formData.set(
        "release_date",
        item.release_date ??
          (item.releaseDates
            ? Object.values(item.releaseDates)[0] ?? ""
            : "")
      );
      formData.set("poster_path", item.poster_path ?? "");
      addFromRecommendationAction(formData);
    }
  };

  const suggestedContent = (
    <SuggestedGrid
      suggested={suggested}
      action={addFromRecommendationAction}
      onSelectItem={setSelectedItem}
    />
  );

  return (
    <div className="relative min-h-screen px-4 py-8">
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-xl"
          style={{ backgroundImage: "url('/cinema-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <div className="relative z-10 animate-fadeIn">
      <TopNav user={user} />
      <main className="mt-page-container pt-8">
          <div className="space-y-10" style={{ marginTop: "48px" }}>
            <h1 className="text-xl font-semibold text-white">Explore</h1>
            <RecommendationsTabs
              suggestedContent={suggestedContent}
              trendingMovies={movies}
              trendingSeries={tv}
              trendingMusic={trendingMusic}
              trendingGames={trendingGames}
              addFromRecommendationAction={addFromRecommendationAction}
              addFromTMDBAction={addFromTMDBAction}
              onSelectItem={setSelectedItem}
            />
          </div>
      </main>
      {selectedItem && (
        <ExploreMediaModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToLibrary={handleAddToLibrary}
        />
      )}
      </div>
    </div>
  );
}
