"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopNav } from "@/components/dashboard/top-nav";
import { WhatsOnYourMind } from "@/components/explore/whats-on-your-mind";
import { ExploreSectionCarousel } from "@/components/explore/explore-section-carousel";
import { SuggestedCard } from "@/components/recommendations/suggested-card";
import { MDBCard } from "@/components/MDBCard";
import { TrendCard } from "@/components/recommendations/recommendations-tabs";
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
  removeFromLibraryAction,
} from "@/app/explore/actions";

function normalizeTitle(title: string | null | undefined): string {
  return (title ?? "").trim().toLowerCase();
}

function filterBySearch<T extends { title?: string | null; name?: string | null }>(
  items: T[],
  q: string
): T[] {
  if (!q.trim()) return items;
  const lower = q.trim().toLowerCase();
  return items.filter(
    (item) =>
      (item.title ?? "").toLowerCase().includes(lower) ||
      (item.name ?? "").toLowerCase().includes(lower)
  );
}

type ExploreContentProps = {
  user: User;
  profile?: Profile | null;
  suggested: EnrichedRecommendation[];
  movies: TMDBMedia[];
  tv: TMDBMedia[];
  trendingGames: TrendingGame[];
  trendingMusic: TrendingMusic[];
  libraryTitles: Set<string>;
  libraryKeys: Set<string>;
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
  libraryKeys,
}: ExploreContentProps) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<ExploreMediaItem | null>(null);
  const [sectionSearch, setSectionSearch] = useState("");

  const filteredSuggested = filterBySearch(suggested, sectionSearch);
  const filteredMovies = filterBySearch(movies, sectionSearch);
  const filteredSeries = filterBySearch(tv, sectionSearch);
  const filteredMusic = sectionSearch.trim()
    ? trendingMusic.filter((item) =>
        item.title.toLowerCase().includes(sectionSearch.trim().toLowerCase())
      )
    : trendingMusic;
  const filteredGames = sectionSearch.trim()
    ? trendingGames.filter((item) =>
        item.title.toLowerCase().includes(sectionSearch.trim().toLowerCase())
      )
    : trendingGames;
  const exploreTypeToKey = (type: string) =>
    type === "tv" ? "series" : (type ?? "movie").toLowerCase();
  const isInLibrary = selectedItem
    ? libraryKeys.has(`${normalizeTitle(selectedItem.title)}|${exploreTypeToKey(selectedItem.type)}`)
    : false;

  const handleAddToLibrary = (item: ExploreMediaItem) => {
    if (item.tmdbId != null && item.tmdbType) {
      const formData = new FormData();
      formData.set("tmdb_id", String(item.tmdbId));
      formData.set("tmdb_type", item.tmdbType);
      addFromTMDBAction(formData).then(() => {
        router.refresh();
        toast.success("Added to library");
      });
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
      addFromRecommendationAction(formData).then(() => {
        router.refresh();
        toast.success("Added to library");
      });
    }
  };

  const handleRemoveFromLibrary = (item: ExploreMediaItem) => {
    const formData = new FormData();
    formData.set("title", item.title);
    formData.set("type", item.type);
    removeFromLibraryAction(formData).then((res) => {
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      router.refresh();
      toast.success("Removed from library");
      setSelectedItem(null);
    });
  };

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
            <div className="space-y-2">
              <label htmlFor="explore-section-search" className="sr-only">
                Search sections
              </label>
              <input
                id="explore-section-search"
                type="search"
                value={sectionSearch}
                onChange={(e) => setSectionSearch(e.target.value)}
                placeholder="Search movies, series, music, games…"
                className="w-full max-w-xs rounded-lg border border-zinc-600 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/30"
                autoComplete="off"
              />
            </div>
            <div className="space-y-10">
              {filteredSuggested.length > 0 && (
                <ExploreSectionCarousel title="AI suggestions">
                  {filteredSuggested.map((rec) => (
                    <SuggestedCard
                      key={rec.id}
                      rec={rec}
                      action={addFromRecommendationAction}
                      onSelectItem={setSelectedItem}
                      isInLibrary={libraryTitles.has(normalizeTitle(rec.title))}
                    />
                  ))}
                </ExploreSectionCarousel>
              )}
              <ExploreSectionCarousel title="Movies">
                {filteredMovies.map((item) => (
                  <MDBCard
                    key={`movie-${item.id}`}
                    item={item}
                    type="movie"
                    action={addFromTMDBAction}
                    onSelectItem={setSelectedItem}
                    isInLibrary={libraryTitles.has(normalizeTitle(item.title ?? item.name))}
                  />
                ))}
              </ExploreSectionCarousel>
              <ExploreSectionCarousel title="Series">
                {filteredSeries.map((item) => (
                  <MDBCard
                    key={`tv-${item.id}`}
                    item={item}
                    type="tv"
                    action={addFromTMDBAction}
                    onSelectItem={setSelectedItem}
                    isInLibrary={libraryTitles.has(normalizeTitle(item.title ?? item.name))}
                  />
                ))}
              </ExploreSectionCarousel>
              <ExploreSectionCarousel title="Music">
                {filteredMusic.map((item) => (
                  <TrendCard
                    key={item.id}
                    item={item}
                    type="music"
                    action={addFromRecommendationAction}
                    onSelectItem={setSelectedItem}
                    isInLibrary={libraryTitles.has(normalizeTitle(item.title))}
                  />
                ))}
              </ExploreSectionCarousel>
              <ExploreSectionCarousel title="Games">
                {filteredGames.map((item) => (
                  <TrendCard
                    key={item.id}
                    item={item}
                    type="game"
                    action={addFromRecommendationAction}
                    onSelectItem={setSelectedItem}
                    isInLibrary={libraryTitles.has(normalizeTitle(item.title))}
                  />
                ))}
              </ExploreSectionCarousel>
            </div>
          </div>
      </main>
      {selectedItem && (
        <ExploreMediaModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToLibrary={handleAddToLibrary}
          isInLibrary={isInLibrary}
          onRemoveFromLibrary={handleRemoveFromLibrary}
        />
      )}
      </div>
    </div>
  );
}
