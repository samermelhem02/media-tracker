"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { resolvePosterUrl } from "@/lib/images";
import { ExploreAddButton } from "@/components/ui/explore-add-button";
import type { TMDBMedia } from "@/lib/tmdb";
import type { TrendingMusic, TrendingGame } from "@/lib/trending";
import type { EnrichedRecommendation } from "@/lib/enrich-recommendations";
import { SuggestedGrid } from "@/components/recommendations/suggested-grid";
import { MDBCard } from "@/components/MDBCard";
import type { ExploreMediaItem } from "@/components/ExploreMediaModal";

type AddFromTMDBAction = (formData: FormData) => Promise<void>;
type AddFromRecommendationAction = (formData: FormData) => Promise<never>;

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

type RecommendationsTabsProps = {
  suggested: EnrichedRecommendation[];
  trendingMovies: TMDBMedia[];
  trendingSeries: TMDBMedia[];
  trendingMusic: TrendingMusic[];
  trendingGames: TrendingGame[];
  addFromRecommendationAction: AddFromRecommendationAction;
  addFromTMDBAction: AddFromTMDBAction;
  onSelectItem: (item: ExploreMediaItem) => void;
  libraryTitles: Set<string>;
};

const TABS = ["Suggested", "Movies", "Series", "Music", "Games"] as const;
type TabId = (typeof TABS)[number];

export function TrendCard({
  item,
  type,
  action,
  onSelectItem,
  isInLibrary,
}: {
  item: TrendingMusic | TrendingGame;
  type: "music" | "game";
  action: AddFromRecommendationAction;
  onSelectItem: (item: ExploreMediaItem) => void;
  isInLibrary?: boolean;
}) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const posterUrl = resolvePosterUrl(item.poster_path, type);

  const handleClick = () => {
    setIsNavigating(true);
    setTimeout(() => {
      onSelectItem(exploreItem);
      setIsNavigating(false);
    }, 120);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInLibrary || isAdding) return;
    setIsAdding(true);
    const form = (e.currentTarget as HTMLButtonElement).closest("form");
    if (form) form.requestSubmit();
  };

  const exploreItem: ExploreMediaItem =
    type === "game"
      ? {
          id: item.id,
          title: item.title,
          type: "game",
          poster_path: item.poster_path,
          genre: (item as TrendingGame).genre,
          developers: (item as TrendingGame).developers,
          publishers: (item as TrendingGame).publishers,
          releaseDates: (item as TrendingGame).releaseDates,
          description: item.description,
        }
      : {
          id: item.id,
          title: item.title,
          type: "music",
          poster_path: item.poster_path,
          creator: (item as TrendingMusic).creator,
          release_date: (item as TrendingMusic).release_date,
          description: item.description,
        };

  const creatorValue =
    type === "music"
      ? (item as TrendingMusic).creator ?? ""
      : (item as TrendingGame).developers?.join(", ") ?? "";
  const releaseDateValue =
    type === "music"
      ? (item as TrendingMusic).release_date ?? ""
      : (item as TrendingGame).releaseDates
        ? Object.values((item as TrendingGame).releaseDates!)[0] ?? ""
        : "";

  return (
    <form action={action} className="block">
      <input type="hidden" name="title" value={item.title} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="description" value={item.description ?? ""} />
      <input type="hidden" name="creator" value={creatorValue} />
      <input type="hidden" name="release_date" value={releaseDateValue} />
      <input type="hidden" name="poster_path" value={item.poster_path ?? ""} />
      <motion.div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`relative flex cursor-pointer flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-900 transition-opacity duration-150 hover:shadow-lg ${isNavigating ? "opacity-80" : ""}`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
      >
        <ExploreAddButton
          isInLibrary={isInLibrary}
          isAdding={isAdding}
          onClick={handleAdd}
          disabled={isInLibrary || isAdding}
          aria-label={isInLibrary ? "In your library" : isAdding ? "Adding…" : "Add to library"}
        />
        <div className="relative w-full aspect-[2/3] shrink-0 overflow-hidden bg-zinc-800">
          <img
            src={posterUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col p-2">
          <h3 className="truncate text-sm font-semibold text-white">{item.title}</h3>
        </div>
      </motion.div>
    </form>
  );
}

export function RecommendationsTabs({
  suggested,
  trendingMovies,
  trendingSeries,
  trendingMusic,
  trendingGames,
  addFromRecommendationAction,
  addFromTMDBAction,
  onSelectItem,
  libraryTitles,
}: RecommendationsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("Suggested");
  const [tabSearchQuery, setTabSearchQuery] = useState("");

  const filteredMovies = filterBySearch(trendingMovies, tabSearchQuery);
  const filteredSeries = filterBySearch(trendingSeries, tabSearchQuery);
  const filteredMusic = tabSearchQuery.trim()
    ? trendingMusic.filter((item) =>
        item.title.toLowerCase().includes(tabSearchQuery.trim().toLowerCase())
      )
    : trendingMusic;
  const filteredGames = tabSearchQuery.trim()
    ? trendingGames.filter((item) =>
        item.title.toLowerCase().includes(tabSearchQuery.trim().toLowerCase())
      )
    : trendingGames;
  const filteredSuggested = tabSearchQuery.trim()
    ? suggested.filter((rec) =>
        (rec.title ?? "").toLowerCase().includes(tabSearchQuery.trim().toLowerCase())
      )
    : suggested;

  return (
    <div className="space-y-6">
      <div className="flex flex-nowrap gap-1.5 overflow-x-auto border-b border-white/15 pb-2 sm:gap-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${
              activeTab === tab
                ? "font-semibold"
                : ""
            }`}
            style={
              activeTab === tab
                ? { background: "var(--mt-tabs-active-bg)", color: "var(--mt-tabs-active-text)" }
                : { background: "var(--mt-tabs-bg)", color: "var(--mt-text-muted)" }
            }
            onMouseEnter={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = "var(--mt-border-subtle)";
                e.currentTarget.style.color = "var(--mt-text-secondary)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = "var(--mt-tabs-bg)";
                e.currentTarget.style.color = "var(--mt-text-muted)";
              }
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search current tab items */}
      <div className="flex items-center gap-2">
        <label htmlFor="explore-tab-search" className="sr-only">
          Search in {activeTab}
        </label>
        <input
          id="explore-tab-search"
          type="search"
          value={tabSearchQuery}
          onChange={(e) => setTabSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab.toLowerCase()}…`}
          className="w-full max-w-xs rounded-lg border border-zinc-600 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/30"
          autoComplete="off"
        />
      </div>

      {activeTab === "Suggested" && (
        <SuggestedGrid
          suggested={filteredSuggested}
          action={addFromRecommendationAction}
          onSelectItem={onSelectItem}
          libraryTitles={libraryTitles}
        />
      )}

      {activeTab === "Movies" && (
        <section className="mt-section">
          <h2 className="mt-section-heading">Trending Movies</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredMovies.map((item) => (
              <MDBCard
                key={`movie-${item.id}`}
                item={item}
                type="movie"
                action={addFromTMDBAction}
                onSelectItem={onSelectItem}
                isInLibrary={libraryTitles.has(normalizeTitle(item.title ?? item.name))}
              />
            ))}
          </div>
        </section>
      )}

      {activeTab === "Series" && (
        <section className="mt-section">
          <h2 className="mt-section-heading">Trending Series</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredSeries.map((item) => (
              <MDBCard
                key={`tv-${item.id}`}
                item={item}
                type="tv"
                action={addFromTMDBAction}
                onSelectItem={onSelectItem}
                isInLibrary={libraryTitles.has(normalizeTitle(item.title ?? item.name))}
              />
            ))}
          </div>
        </section>
      )}

      {activeTab === "Music" && (
        <section className="mt-section">
          <h2 className="mt-section-heading">Trending Music</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredMusic.map((item) => (
              <TrendCard
                key={item.id}
                item={item}
                type="music"
                action={addFromRecommendationAction}
                onSelectItem={onSelectItem}
                isInLibrary={libraryTitles.has(normalizeTitle(item.title))}
              />
            ))}
          </div>
        </section>
      )}

      {activeTab === "Games" && (
        <section className="mt-section">
          <h2 className="mt-section-heading">Trending Games</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredGames.map((item) => (
              <TrendCard
                key={item.id}
                item={item}
                type="game"
                action={addFromRecommendationAction}
                onSelectItem={onSelectItem}
                isInLibrary={libraryTitles.has(normalizeTitle(item.title))}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
