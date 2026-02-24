"use client";

import { useRef, useState, useLayoutEffect, useEffect, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { MediaItem } from "@/lib/db-types";
import { MediaCard } from "@/components/media/media-card";

const SECTION_ORDER: Array<{ key: string; label: string }> = [
  { key: "movie", label: "Movies" },
  { key: "series", label: "Series" },
  { key: "music", label: "Music" },
  { key: "game", label: "Games" },
];

const CAROUSEL_GAP_PX = 16;
const DESKTOP_BREAKPOINT_PX = 1024; // lg: 4 cards; below: 2 cards

function groupByMediaType(items: MediaItem[]): Record<string, MediaItem[]> {
  return items.reduce(
    (acc, item) => {
      const type = item.media_type ?? "movie";
      acc[type] ??= [];
      acc[type].push(item);
      return acc;
    },
    {} as Record<string, MediaItem[]>
  );
}

function LibrarySectionCarousel({
  items,
  onEditItem,
  onDeleted,
}: {
  items: MediaItem[];
  onEditItem?: (item: MediaItem) => void;
  onDeleted?: (id: string) => void;
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
        <div
          className="flex flex-nowrap gap-4 py-1"
          style={{ width: "max-content" }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0"
              style={{ width: cardWidth || 200 }}
            >
              <MediaCard
                item={item}
                onEdit={onEditItem}
                onDeleted={onDeleted}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MediaList({
  items,
  groupByType,
  onEditItem,
  onDeleted,
}: {
  items: MediaItem[];
  groupByType: boolean;
  onEditItem?: (item: MediaItem) => void;
  onDeleted?: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <section>
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No media items yet. Add one above or explore trending picks.
          </p>
          <Link
            href="/explore"
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            Explore Trending
          </Link>
        </div>
      </section>
    );
  }

  if (groupByType) {
    const grouped = groupByMediaType(items);
    return (
      <section className="space-y-10">
        {SECTION_ORDER.map(({ key, label }) => {
          const sectionItems = grouped[key];
          if (!sectionItems?.length) return null;
          return (
            <div key={key}>
              <h2 className="mb-4 text-lg font-semibold text-white">{label}</h2>
              <LibrarySectionCarousel
                items={sectionItems}
                onEditItem={onEditItem}
                onDeleted={onDeleted}
              />
            </div>
          );
        })}
      </section>
    );
  }

  return (
    <section>
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.05 } },
          hidden: {},
        }}
      >
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 },
              }}
              transition={{ duration: 0.2 }}
              exit={{ opacity: 0 }}
            >
              <MediaCard
                item={item}
                onEdit={onEditItem}
                onDeleted={onDeleted}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
