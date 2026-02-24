"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTransition } from "react";
import { motion } from "framer-motion";
import { getDefaultImage } from "@/lib/getDefaultImage";
import { resolvePosterUrl } from "@/lib/images";
import type { MediaType } from "@/types/media";

export type ExploreMediaItem = {
  id: string;
  title: string;
  type: MediaType;
  poster_path?: string | null;
  rating?: number | null;
  genre?: string[];
  developers?: string[];
  publishers?: string[];
  releaseDates?: Record<string, string> | null;
  description?: string | null;
  creator?: string | null;
  release_date?: string | null;
  /** For Add to Library via TMDB */
  tmdbId?: number;
  tmdbType?: "movie" | "tv";
};

type ExploreMediaModalProps = {
  item: ExploreMediaItem;
  onClose: () => void;
  onAddToLibrary: (item: ExploreMediaItem) => void;
  isInLibrary?: boolean;
  onRemoveFromLibrary?: (item: ExploreMediaItem) => void;
};

export default function ExploreMediaModal({
  item,
  onClose,
  onAddToLibrary,
  isInLibrary = false,
  onRemoveFromLibrary,
}: ExploreMediaModalProps) {
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const posterSrc = item.poster_path
    ? resolvePosterUrl(item.poster_path, item.type)
    : getDefaultImage(item.type);

  const year = item.release_date
    ? new Date(item.release_date).getFullYear()
    : item.releaseDates
      ? parseInt(Object.values(item.releaseDates)[0]?.slice(0, 4) ?? "0", 10)
      : null;
  const hasYear = year != null && !Number.isNaN(year);

  const handleAdd = () => {
    startTransition(() => {
      onAddToLibrary(item);
      onClose();
    });
  };

  const handleRemove = () => {
    if (!onRemoveFromLibrary) return;
    startTransition(() => {
      onRemoveFromLibrary(item);
      // Modal is closed by parent via setSelectedItem(null) after success
    });
  };

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="relative my-auto w-full max-w-2xl max-h-[min(90vh,800px)] flex flex-col rounded-xl bg-zinc-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image - full width */}
        <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-zinc-800">
          <img
            src={posterSrc}
            alt=""
            className="h-full w-full object-cover"
          />
          {/* Glassy fade at bottom into content */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-12 bg-gradient-to-t from-zinc-900/70 to-transparent backdrop-blur-[0.5px]"
            aria-hidden
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            aria-label="Close"
          >
            <span className="text-xl leading-none">✕</span>
          </button>
        </div>

        {/* Content: pulled up under the fade so the seam is covered */}
        <div className="overflow-y-auto flex-1 min-h-0 -mt-12 pt-20 px-6 pb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
            {item.title}
          </h2>

          {/* Metadata pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {hasYear && (
              <span className="rounded-md bg-zinc-700 px-2.5 py-1 text-xs font-medium text-white">
                {year}
              </span>
            )}
            <span className="rounded-md bg-zinc-700 px-2.5 py-1 text-xs font-medium text-white capitalize">
              {item.type}
            </span>
            {item.genre?.map((g) => (
              <span
                key={g}
                className="rounded-md bg-zinc-700 px-2.5 py-1 text-xs font-medium text-white"
              >
                {g}
              </span>
            ))}
            {item.rating != null && (
              <span className="rounded-md bg-zinc-700 px-2.5 py-1 text-xs font-medium text-white">
                ⭐ {item.rating}
              </span>
            )}
          </div>

          {item.creator && (
            <p className="mt-2 text-sm text-zinc-400">
              Created by {item.creator}
            </p>
          )}

          {item.developers && item.developers.length > 0 && (
            <p className="mt-1 text-sm text-zinc-400">
              Developers: {item.developers.join(", ")}
            </p>
          )}

          {item.publishers && item.publishers.length > 0 && (
            <p className="mt-1 text-sm text-zinc-400">
              Publishers: {item.publishers.join(", ")}
            </p>
          )}

          {item.description && (
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              {item.description}
            </p>
          )}

          <div className="mt-6">
            {isInLibrary && onRemoveFromLibrary ? (
              <button
                type="button"
                disabled={isPending}
                onClick={handleRemove}
                className="w-full rounded-lg border border-zinc-500 bg-transparent px-6 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {isPending ? "Removing…" : "Remove From Library"}
              </button>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={handleAdd}
                className="w-full rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {isPending ? "Adding…" : "Add to Library"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
