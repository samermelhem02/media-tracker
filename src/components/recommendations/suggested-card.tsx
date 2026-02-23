"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { resolvePosterUrl } from "@/lib/images";
import type { EnrichedRecommendation } from "@/lib/enrich-recommendations";
import type { ExploreMediaItem } from "@/components/ExploreMediaModal";

type AddFromRecommendationAction = (formData: FormData) => Promise<never>;

type SuggestedCardProps = {
  rec: EnrichedRecommendation;
  action: AddFromRecommendationAction;
  onSelectItem: (item: ExploreMediaItem) => void;
};

const CARD_TRANSITION = { duration: 0.18, ease: "easeInOut" as const };

function toExploreItem(rec: EnrichedRecommendation): ExploreMediaItem {
  return {
    id: rec.id,
    title: rec.title,
    type: rec.type,
    poster_path: rec.poster_path,
    rating: rec.rating ?? null,
    description: rec.description ?? null,
    creator: rec.creator ?? null,
    release_date: rec.release_date ?? null,
  };
}

export function SuggestedCard({ rec, action, onSelectItem }: SuggestedCardProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const posterUrl = resolvePosterUrl(rec.poster_path, rec.type);

  const handleClick = () => {
    setIsNavigating(true);
    setTimeout(() => {
      onSelectItem(toExploreItem(rec));
      setIsNavigating(false);
    }, 120);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      className={`relative group cursor-pointer rounded-lg overflow-hidden border border-white/10 bg-zinc-900 transition-opacity duration-150 hover:shadow-lg ${isNavigating ? "opacity-80" : ""}`}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={CARD_TRANSITION}
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-zinc-800">
        <img
          src={posterUrl}
          alt=""
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-yellow-500"
          aria-label="Add to library"
        >
          +
        </button>
      </div>

      <div className="space-y-1 p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-white">
            {rec.title}
          </h3>
          <span className="shrink-0 text-[10px] uppercase text-yellow-400">
            {rec.type}
          </span>
        </div>

        {rec.rating != null && (
          <div className="text-xs text-yellow-400">
            ⭐ {rec.rating}
          </div>
        )}

        {rec.reason && (
          <p className="line-clamp-2 text-xs text-white/60">
            {rec.reason}
          </p>
        )}
      </div>
    </motion.div>
  );

  return (
    <form ref={formRef} action={action} className="block">
      <input type="hidden" name="title" value={rec.title} />
      <input type="hidden" name="type" value={rec.type} />
      <input type="hidden" name="description" value={rec.description ?? ""} />
      <input type="hidden" name="creator" value={rec.creator ?? ""} />
      <input type="hidden" name="release_date" value={rec.release_date ?? ""} />
      <input type="hidden" name="poster_path" value={rec.poster_path ?? ""} />
      {cardBody}
    </form>
  );
}
