"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/dashboard/top-nav";
import { RecommendationsTabs } from "@/components/recommendations/recommendations-tabs";
import { SuggestedGrid } from "@/components/recommendations/suggested-grid";
import { WhatsOnYourMind } from "@/components/explore/whats-on-your-mind";
import ExploreMediaModal, {
  type ExploreMediaItem,
} from "@/components/ExploreMediaModal";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/db-types";
import type { TMDBMedia } from "@/lib/tmdb";
import type { TrendingMusic, TrendingGame } from "@/lib/trending";
import type { EnrichedRecommendation } from "@/lib/enrich-recommendations";
import {
  addFromTMDBAction,
  addFromRecommendationAction,
} from "@/app/explore/actions";

type ExploreContentProps = {
  user: User;
  profile?: Profile | null;
  suggested: EnrichedRecommendation[];
  movies: TMDBMedia[];
  tv: TMDBMedia[];
  trendingGames: TrendingGame[];
  trendingMusic: TrendingMusic[];
  libraryTitles: Set<string>;
};

export function ExploreContent({
  user,
  profile,
  suggested,
  movies,
  tv,
  trendingGames,
  trendingMusic,
  libraryTitles,
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
      libraryTitles={libraryTitles}
    />
  );

  return (
    <div className="relative min-h-screen px-4 py-6 sm:px-5 sm:py-8 md:px-6">
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-xl"
          style={{ backgroundImage: "url('/cinema-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <div className="relative z-10 animate-fadeIn">
      <TopNav user={user} profile={profile} />
      <main className="mt-page-container pt-6 sm:pt-8">
          <div className="space-y-6 sm:space-y-10 mt-8 sm:mt-12">
            <h1 className="text-xl font-semibold text-white">Explore</h1>
            <WhatsOnYourMind
              addFromRecommendationAction={addFromRecommendationAction}
              onSelectItem={setSelectedItem}
              libraryTitles={libraryTitles}
            />
            <RecommendationsTabs
              suggestedContent={suggestedContent}
              trendingMovies={movies}
              trendingSeries={tv}
              trendingMusic={trendingMusic}
              trendingGames={trendingGames}
              addFromRecommendationAction={addFromRecommendationAction}
              addFromTMDBAction={addFromTMDBAction}
              onSelectItem={setSelectedItem}
              libraryTitles={libraryTitles}
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
