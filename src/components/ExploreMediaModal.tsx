"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTransition } from "react";
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
};

export default function ExploreMediaModal({
  item,
  onClose,
  onAddToLibrary,
}: ExploreMediaModalProps) {
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const posterSrc = item.poster_path
    ? resolvePosterUrl(item.poster_path, item.type)
    : getDefaultImage(item.type);

  const handleAdd = () => {
    startTransition(() => {
      onAddToLibrary(item);
      onClose();
    });
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-xl border border-white/10 bg-zinc-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-4 top-4 text-white/60 hover:text-white"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex gap-6">
          <div className="w-1/3 shrink-0">
            <div className="aspect-[2/3] overflow-hidden rounded-md bg-zinc-800">
              <img
                src={posterSrc}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-8rem)]">
            <h2 className="text-xl font-semibold text-white">{item.title}</h2>

            <span className="text-xs uppercase text-yellow-400">{item.type}</span>

            {item.rating != null && (
              <div className="text-sm text-yellow-400">⭐ {item.rating}</div>
            )}

            {item.genre && item.genre.length > 0 && (
              <div className="text-sm text-white/60">
                Genres: {item.genre.join(", ")}
              </div>
            )}

            {item.developers && item.developers.length > 0 && (
              <div className="text-sm text-white/60">
                Developers: {item.developers.join(", ")}
              </div>
            )}

            {item.publishers && item.publishers.length > 0 && (
              <div className="text-sm text-white/60">
                Publishers: {item.publishers.join(", ")}
              </div>
            )}

            {item.releaseDates &&
              Object.keys(item.releaseDates).length > 0 && (
                <div className="text-sm text-white/60">
                  Release:{" "}
                  {Object.entries(item.releaseDates)
                    .map(([region, date]) => `${region}: ${date}`)
                    .join(" | ")}
                </div>
              )}

            {!item.releaseDates && item.release_date && (
              <div className="text-sm text-white/60">
                Release: {item.release_date}
              </div>
            )}

            {item.creator && (
              <div className="text-sm text-white/60">
                Created by: {item.creator}
              </div>
            )}

            {item.description && (
              <p className="text-sm text-white/70">{item.description}</p>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                disabled={isPending}
                onClick={handleAdd}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50"
              >
                {isPending ? "Adding…" : "Add to Library"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
