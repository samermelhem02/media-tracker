"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { resolvePosterUrl } from "@/lib/images";
import { ExploreAddButton } from "@/components/ui/explore-add-button";
import type { TMDBMedia } from "@/lib/tmdb";
import type { ExploreMediaItem } from "@/components/ExploreMediaModal";

type AddFromTMDBAction = (formData: FormData) => Promise<void>;

const CARD_TRANSITION = { duration: 0.18, ease: "easeInOut" as const };

export function MDBCard({
  item,
  type,
  action,
  onSelectItem,
  isInLibrary,
}: {
  item: TMDBMedia;
  type: "movie" | "tv";
  action?: AddFromTMDBAction;
  onSelectItem: (item: ExploreMediaItem) => void;
  isInLibrary?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const title = item.title ?? item.name ?? "Unknown";
  const poster = resolvePosterUrl(item.poster_path, type === "tv" ? "series" : "movie");
  const rating = item.vote_average;
  const mediaType = type === "tv" ? "series" : "movie";

  const exploreItem: ExploreMediaItem = {
    id: String(item.id),
    title,
    type: mediaType,
    poster_path: item.poster_path,
    rating: rating != null && Number.isFinite(rating) ? Number(rating) : null,
    description: item.overview ?? null,
    release_date: item.release_date ?? item.first_air_date ?? null,
    tmdbId: item.id,
    tmdbType: type,
  };

  const handleClick = () => {
    setIsNavigating(true);
    setTimeout(() => {
      onSelectItem(exploreItem);
      setIsNavigating(false);
    }, 120);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdding || isInLibrary) return;
    setIsAdding(true);
    formRef.current?.requestSubmit();
  };

  const cardBody = (
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
      transition={CARD_TRANSITION}
    >
      {action && (
        <ExploreAddButton
          isInLibrary={isInLibrary}
          isAdding={isAdding}
          onClick={handleAdd}
          disabled={isInLibrary || isAdding}
          aria-label={isInLibrary ? "In your library" : isAdding ? "Adding…" : "Add to library"}
        />
      )}
      <div className="relative w-full shrink-0 overflow-hidden bg-zinc-800 aspect-[2/3]">
        <img
          src={poster}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col p-2">
        <h3 className="truncate text-sm font-semibold text-white">{title}</h3>
        {rating != null && Number.isFinite(rating) && (
          <div className="mt-0.5 text-xs text-yellow-400">
            ⭐ {Number(rating).toFixed(1)}
          </div>
        )}
      </div>
    </motion.div>
  );

  const content = action ? (
    <form ref={formRef} action={action} className="block">
      <input type="hidden" name="tmdb_id" value={item.id} />
      <input type="hidden" name="tmdb_type" value={type} />
      {cardBody}
    </form>
  ) : (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="block cursor-pointer"
    >
      {cardBody}
    </div>
  );

  return content;
}
