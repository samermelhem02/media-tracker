"use client";

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
              <motion.div
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } },
                  hidden: {},
                }}
              >
                <AnimatePresence>
                  {sectionItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
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
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
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
