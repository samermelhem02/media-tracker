"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { MediaItem } from "@/lib/db-types";
import { resolvePosterUrl } from "@/lib/images";
import MediaDetailModal from "./media-detail-modal";

function PosterPlaceholder() {
  return (
    <div className="aspect-[2/3] overflow-hidden rounded-md flex items-center justify-center bg-zinc-800" aria-hidden>
      <svg className="h-16 w-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
      </svg>
    </div>
  );
}

function PosterImage({
  imageUrl,
  mediaType,
}: {
  imageUrl: string | null | undefined;
  mediaType?: string;
}) {
  const [error, setError] = useState(false);
  const src = resolvePosterUrl(imageUrl, mediaType);
  if (error) return <PosterPlaceholder />;
  return (
    <div className="aspect-[2/3] overflow-hidden rounded-md bg-zinc-800">
      <img src={src} alt="" className="h-full w-full object-cover" onError={() => setError(true)} />
    </div>
  );
}

export function PublicMediaCard({
  item,
  reviewLabel,
}: {
  item: MediaItem;
  /** e.g. "Samer's review" for shared profile */
  reviewLabel?: string;
}) {
  const modalItem = {
    title: item.title,
    image_url: item.image_url,
    media_type: item.media_type,
    status: item.status,
    rating: item.rating,
    description: item.description,
    creator: item.creator,
    genre: item.genre,
    release_date: item.release_date,
    review: item.review,
  };

  const cardBody = (
    <motion.div
      className="flex flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-900 cursor-pointer transition-opacity duration-150 hover:shadow-lg"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
    >
      <PosterImage imageUrl={item.image_url} mediaType={item.media_type} />
      <div className="shrink-0 p-2">
        <h3 className="text-sm font-medium leading-tight line-clamp-1">{item.title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-white/70">{item.status}</span>
          {item.rating != null && (
            <span className="text-[10px] text-yellow-400">★ {item.rating}</span>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <MediaDetailModal
      item={modalItem}
      isLibrary={false}
      onClose={() => {}}
      reviewLabel={reviewLabel}
    >
      {cardBody}
    </MediaDetailModal>
  );
}
