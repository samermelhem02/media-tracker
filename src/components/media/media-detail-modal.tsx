"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { resolvePosterUrl } from "@/lib/images";

export type MediaDetailModalItem = {
  posterUrl?: string | null;
  image_url?: string | null;
  title?: string;
  name?: string;
  rating?: number | null;
  vote_average?: number;
  creator?: string | null;
  genre?: string | null;
  status?: string;
  media_type?: string;
  description?: string | null;
  review?: string | null;
  overview?: string;
  release_date?: string | null;
};

export default function MediaDetailModal({
  item,
  children,
  onAdd,
  isLibrary = false,
  onEdit,
  onDelete,
  onOpenRequest,
  onClose: onCloseCallback,
  /** When set (e.g. on shared profile), used instead of "Your Review" for the review section label */
  reviewLabel,
}: {
  item: MediaDetailModalItem;
  children: React.ReactNode;
  onAdd?: () => void;
  isLibrary?: boolean;
  onEdit?: (item: MediaDetailModalItem) => void;
  onDelete?: (item: MediaDetailModalItem) => void;
  onOpenRequest?: () => void;
  onClose?: () => void;
  reviewLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const openModal = () => {
    onOpenRequest?.();
    setTimeout(() => setOpen(true), 120);
  };

  const closeModal = () => {
    onCloseCallback?.();
    setOpen(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const imageUrl =
    item.posterUrl ??
    (item.image_url && !String(item.image_url).startsWith("media-posters:")
      ? item.image_url
      : null);
  const posterSrc = resolvePosterUrl(imageUrl, item.media_type);
  const title = item.title ?? item.name ?? "Unknown";
  const rating = item.rating ?? item.vote_average;
  const description = item.description || item.overview || "";
  const year = item.release_date
    ? new Date(item.release_date).getFullYear()
    : null;
  const genreList = item.genre
    ? item.genre.split(",").map((g) => g.trim()).filter(Boolean)
    : [];

  if (!mounted) return null;

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          openModal();
        }}
        className="cursor-pointer"
      >
        {children}
      </div>

      {open &&
        createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 sm:p-6 overflow-y-auto"
            onClick={() => closeModal()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative my-auto w-full max-w-2xl max-h-[min(90vh,800px)] flex flex-col rounded-xl bg-zinc-900 shadow-2xl overflow-hidden"
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
                  onClick={() => closeModal()}
                  className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                  aria-label="Close"
                >
                  <span className="text-xl leading-none">✕</span>
                </button>
              </div>

              {/* Content: pulled up under the fade so the seam is covered */}
              <div className="overflow-y-auto flex-1 min-h-0 -mt-12 pt-20 px-6 pb-6">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
                  {title}
                </h2>

                {/* Metadata pills */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {year != null && (
                    <span className="rounded-md bg-zinc-700 px-2.5 py-1 text-xs font-medium text-white">
                      {year}
                    </span>
                  )}
                  {item.media_type && (
                    <span className="rounded-md bg-zinc-700 px-2.5 py-1 text-xs font-medium text-white capitalize">
                      {item.media_type}
                    </span>
                  )}
                  {item.status && (
                    <span className="rounded-md bg-zinc-700 px-2.5 py-1 text-xs font-medium text-white capitalize">
                      {item.status}
                    </span>
                  )}
                  {genreList.map((g) => (
                    <span
                      key={g}
                      className="rounded-md bg-zinc-700 px-2.5 py-1 text-xs font-medium text-white"
                    >
                      {g}
                    </span>
                  ))}
                  {rating != null && rating !== undefined && (
                    <span className="rounded-md bg-zinc-700 px-2.5 py-1 text-xs font-medium text-white">
                      ⭐ {rating}
                    </span>
                  )}
                </div>

                {item.creator && (
                  <p className="mt-2 text-sm text-zinc-400">
                    Created by {item.creator}
                  </p>
                )}

                <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                  {description}
                </p>

                {item.review && (
                  <div className="mt-4 border-t border-zinc-700 pt-4">
                    <h4 className="mb-2 text-sm font-semibold text-zinc-400">
                      {reviewLabel ?? "Your Review"}
                    </h4>
                    <p className="text-sm text-zinc-300">{item.review}</p>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3">
                  {isLibrary ? (
                    <>
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => {
                            onEdit(item);
                            closeModal();
                          }}
                          className="flex-1 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(item);
                            closeModal();
                          }}
                          className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </>
                  ) : (
                    onAdd && (
                      <button
                        type="button"
                        onClick={() => {
                          onAdd();
                          closeModal();
                        }}
                        className="w-full rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                      >
                        Add to Library
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}
    </>
  );
}
