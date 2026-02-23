"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { resolvePosterUrl } from "@/lib/images";
import type { TMDBMedia } from "@/lib/tmdb";
import type { TrendingMusic, TrendingGame } from "@/lib/trending";
import { MDBCard } from "@/components/MDBCard";
import type { ExploreMediaItem } from "@/components/ExploreMediaModal";

type AddFromTMDBAction = (formData: FormData) => Promise<void>;
type AddFromRecommendationAction = (formData: FormData) => Promise<never>;

type RecommendationsTabsProps = {
  suggestedContent: React.ReactNode;
  trendingMovies: TMDBMedia[];
  trendingSeries: TMDBMedia[];
  trendingMusic: TrendingMusic[];
  trendingGames: TrendingGame[];
  addFromRecommendationAction: AddFromRecommendationAction;
  addFromTMDBAction: AddFromTMDBAction;
  onSelectItem: (item: ExploreMediaItem) => void;
};

const TABS = ["Suggested", "Movies", "Series", "Music", "Games"] as const;
type TabId = (typeof TABS)[number];

function TrendCard({
  item,
  type,
  action,
  onSelectItem,
}: {
  item: TrendingMusic | TrendingGame;
  type: "music" | "game";
  action: AddFromRecommendationAction;
  onSelectItem: (item: ExploreMediaItem) => void;
}) {
  const [isNavigating, setIsNavigating] = useState(false);
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
        className={`relative flex h-[420px] cursor-pointer flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-900 transition-opacity duration-150 hover:shadow-lg ${isNavigating ? "opacity-80" : ""}`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
      >
        <button
          type="button"
          onClick={handleAdd}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-yellow-500"
          aria-label="Add to library"
        >
          +
        </button>
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
  suggestedContent,
  trendingMovies,
  trendingSeries,
  trendingMusic,
  trendingGames,
  addFromRecommendationAction,
  addFromTMDBAction,
  onSelectItem,
}: RecommendationsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("Suggested");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-white/15 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${
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

      {activeTab === "Suggested" && suggestedContent}

      {activeTab === "Movies" && (
        <section className="mt-section">
          <h2 className="mt-section-heading">Trending Movies</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {trendingMovies.map((item) => (
              <MDBCard
                key={`movie-${item.id}`}
                item={item}
                type="movie"
                action={addFromTMDBAction}
                onSelectItem={onSelectItem}
              />
            ))}
          </div>
        </section>
      )}

      {activeTab === "Series" && (
        <section className="mt-section">
          <h2 className="mt-section-heading">Trending Series</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {trendingSeries.map((item) => (
              <MDBCard
                key={`tv-${item.id}`}
                item={item}
                type="tv"
                action={addFromTMDBAction}
                onSelectItem={onSelectItem}
              />
            ))}
          </div>
        </section>
      )}

      {activeTab === "Music" && (
        <section className="mt-section">
          <h2 className="mt-section-heading">Trending Music</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {trendingMusic.map((item) => (
              <TrendCard
                key={item.id}
                item={item}
                type="music"
                action={addFromRecommendationAction}
                onSelectItem={onSelectItem}
              />
            ))}
          </div>
        </section>
      )}

      {activeTab === "Games" && (
        <section className="mt-section">
          <h2 className="mt-section-heading">Trending Games</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {trendingGames.map((item) => (
              <TrendCard
                key={item.id}
                item={item}
                type="game"
                action={addFromRecommendationAction}
                onSelectItem={onSelectItem}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
