"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
}: {
  item: MediaDetailModalItem;
  children: React.ReactNode;
  onAdd?: () => void;
  isLibrary?: boolean;
  onEdit?: (item: MediaDetailModalItem) => void;
  onDelete?: (item: MediaDetailModalItem) => void;
  onOpenRequest?: () => void;
  onClose?: () => void;
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

  const imageUrl =
    item.posterUrl ??
    (item.image_url && !String(item.image_url).startsWith("media-posters:")
      ? item.image_url
      : null);
  const posterSrc = resolvePosterUrl(imageUrl, item.media_type);
  const title = item.title ?? item.name ?? "Unknown";
  const rating = item.rating ?? item.vote_average;
  const description = item.description || item.overview || "";

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
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
            onClick={() => closeModal()}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl rounded-xl border border-white/10 bg-zinc-900 p-6"
            >
              <button
                type="button"
                onClick={() => closeModal()}
                className="absolute right-4 top-4 text-white/60 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-800">
                  <img
                    src={posterSrc}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-col">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    {title}
                  </h2>

                  {item.creator && (
                    <p className="mt-1 text-sm text-zinc-400">
                      Created by: {item.creator}
                    </p>
                  )}

                  {item.release_date && (
                    <p className="mt-1 text-sm text-zinc-400">
                      Released:{" "}
                      {new Date(item.release_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}

                  {rating != null && rating !== undefined && (
                    <div className="mt-2 flex items-center gap-2 text-yellow-400">
                      ⭐ <span className="text-white">{rating}</span>
                    </div>
                  )}

                  {(item.status || item.media_type) && (
                    <p className="mt-2 text-xs uppercase tracking-wide text-zinc-500">
                      {item.media_type}
                      {item.media_type && item.status ? " • " : ""}
                      {item.status}
                    </p>
                  )}

                  {item.genre && !item.status && (
                    <p className="mt-2 text-xs uppercase tracking-wide text-zinc-500">
                      {item.genre}
                    </p>
                  )}

                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                    {description}
                  </p>

                  {item.review && (
                    <div className="mt-4 border-t border-zinc-700 pt-4">
                      <h4 className="mb-2 text-sm font-semibold text-zinc-400">
                        Your Review
                      </h4>
                      <p className="text-sm text-zinc-300">{item.review}</p>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    {isLibrary ? (
                      <>
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => {
                              onEdit(item);
                              closeModal();
                            }}
                            className="rounded-md bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600"
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
                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
                          className="rounded-md bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600"
                        >
                          Add to Library
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
