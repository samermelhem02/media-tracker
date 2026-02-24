"use client";

import { useRef, useState, useLayoutEffect, useEffect, useCallback } from "react";
import Link from "next/link";
import type { MediaItem } from "@/lib/db-types";
import type { Profile } from "@/lib/db-types";
import { PublicMediaCard } from "@/components/media/public-media-card";
import { GlassCard } from "@/components/ui/glass-card";

const CAROUSEL_GAP_PX = 16;
const DESKTOP_BREAKPOINT_PX = 1024;

/** 3 sections: Movies, Series, Music & Games */
const SECTIONS: Array<{ key: string; label: string; types: string[] }> = [
  { key: "movies", label: "Movies", types: ["movie"] },
  { key: "series", label: "Series", types: ["series"] },
  { key: "music-games", label: "Music & Games", types: ["music", "game"] },
];

function groupItems(items: MediaItem[]): Record<string, MediaItem[]> {
  return SECTIONS.reduce(
    (acc, section) => {
      acc[section.key] = items.filter((item) =>
        section.types.includes(item.media_type ?? "movie")
      );
      return acc;
    },
    {} as Record<string, MediaItem[]>
  );
}

function SectionCarousel({
  items,
  sectionKey,
  reviewLabel,
}: {
  items: MediaItem[];
  sectionKey: string;
  reviewLabel?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateCardWidth = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    const cardsPerRow = w >= DESKTOP_BREAKPOINT_PX ? 4 : 2;
    const gapTotal = (cardsPerRow - 1) * CAROUSEL_GAP_PX;
    const width = Math.floor((w - gapTotal) / cardsPerRow);
    setCardWidth(width > 0 ? width : 200);
  }, []);

  const updateScrollState = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useLayoutEffect(() => {
    updateCardWidth();
    const ro = new ResizeObserver(updateCardWidth);
    const el = viewportRef.current;
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, [updateCardWidth]);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState]);

  useEffect(() => {
    if (!cardWidth) return;
    const id = requestAnimationFrame(() => updateScrollState());
    return () => cancelAnimationFrame(id);
  }, [cardWidth, items.length, updateScrollState]);

  const scrollByTwo = (direction: "left" | "right") => {
    const el = viewportRef.current;
    if (!el || !cardWidth) return;
    const step = 2 * cardWidth + CAROUSEL_GAP_PX;
    el.scrollBy({ left: direction === "right" ? step : -step, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <div className="relative min-w-0">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByTwo("left")}
          className="absolute left-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white shadow-lg transition hover:bg-black/90"
          aria-label="Previous"
        >
          <span className="text-xl leading-none">‹</span>
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByTwo("right")}
          className="absolute right-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white shadow-lg transition hover:bg-black/90"
          aria-label="Next"
        >
          <span className="text-xl leading-none">›</span>
        </button>
      )}
      <div
        ref={viewportRef}
        className="min-w-0 overflow-x-auto overflow-y-hidden scroll-smooth touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex flex-nowrap gap-4 py-1" style={{ width: "max-content" }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0"
              style={{ width: cardWidth || 200 }}
            >
              <PublicMediaCard item={item} reviewLabel={reviewLabel} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type PublicProfileViewProps = {
  profile: Profile;
  items: MediaItem[];
};

function getOwnerDisplayName(profile: Profile): string {
  if (profile.first_name?.trim()) return profile.first_name.trim();
  if (profile.display_name?.trim()) return profile.display_name.trim();
  return profile.username;
}

export function PublicProfileView({ profile, items: initialItems }: PublicProfileViewProps) {
  const [search, setSearch] = useState("");
  const ownerName = getOwnerDisplayName(profile);
  const reviewLabel = `${ownerName}'s review`;

  const filteredItems = search.trim()
    ? initialItems.filter((item) =>
        (item.title ?? "")
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      )
    : initialItems;

  const grouped = groupItems(filteredItems);

  /** Top-rated items (has rating), sorted by rating descending, for "Samer's top ratings" section */
  const topRatedItems = [...initialItems]
    .filter((item) => item.rating != null && item.rating > 0)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 12);

  return (
    <div className="relative min-h-screen px-4 py-6 sm:px-5 sm:py-8 md:px-6">
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-xl"
          style={{ backgroundImage: "url('/cinema-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <GlassCard className="mb-4 p-4 sm:mb-6 sm:p-6">
          <header className="border-b border-white/10 pb-4">
            <h1 className="text-xl font-semibold text-white">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-sm text-zinc-400">@{profile.username}</p>
          </header>
          <div className="mt-4">
            <label htmlFor="public-search" className="sr-only">
              Search media
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                id="public-search"
                type="search"
                placeholder="Search title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder-zinc-500 focus:border-[var(--mt-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--mt-accent)]"
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          {initialItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">No media items yet.</p>
          ) : filteredItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">No matches for &quot;{search}&quot;.</p>
          ) : (
            <section className="space-y-10">
              {topRatedItems.length > 0 && (
                <div>
                  <h2 className="mb-4 text-lg font-semibold text-white">
                    {ownerName}&apos;s top ratings
                  </h2>
                  <SectionCarousel
                    items={topRatedItems}
                    sectionKey="top"
                    reviewLabel={reviewLabel}
                  />
                </div>
              )}
              {SECTIONS.map(({ key, label }) => {
                const sectionItems = grouped[key];
                if (!sectionItems?.length) return null;
                return (
                  <div key={key}>
                    <h2 className="mb-4 text-lg font-semibold text-white">{label}</h2>
                    <SectionCarousel
                      items={sectionItems}
                      sectionKey={key}
                      reviewLabel={reviewLabel}
                    />
                  </div>
                );
              })}
            </section>
          )}
        </GlassCard>

        <p className="mt-8">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-400 underline hover:text-white"
          >
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
