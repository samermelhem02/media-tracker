"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import type { MediaItem } from "@/lib/db-types";
import { STORAGE_PATH_PREFIX } from "@/lib/storage";
import { resolvePosterUrl } from "@/lib/images";
import { deleteMediaItemAction } from "@/app/library/actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditMediaModal } from "@/app/dashboard/edit-media-modal";
import MediaDetailModal from "./media-detail-modal";
import { useRouter } from "next/navigation";

function PosterPlaceholder() {
  return (
    <div
      className="aspect-[2/3] overflow-hidden rounded-md flex items-center justify-center bg-zinc-800"
      aria-hidden
    >
      <svg
        className="h-16 w-16 text-white/30"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
        />
      </svg>
    </div>
  );
}

function PosterImage({
  imageUrl,
  title,
  mediaType,
}: {
  imageUrl: string | null | undefined;
  title: string;
  mediaType?: string;
}) {
  const [error, setError] = useState(false);
  const src = resolvePosterUrl(imageUrl, mediaType);

  if (error) {
    return <PosterPlaceholder />;
  }
  return (
    <div className="aspect-[2/3] overflow-hidden rounded-md bg-zinc-800">
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

export type MediaItemWithPoster = MediaItem & { posterUrl?: string | null };

export function MediaCard({
  item,
  onEdit,
  onDeleted,
}: {
  item: MediaItemWithPoster;
  onEdit?: (item: MediaItem) => void;
  onDeleted?: (id: string) => void;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleEditClick = () => {
    if (onEdit) onEdit(item);
    else setEditOpen(true);
  };

  const handleDelete = (formData: FormData) => {
    setDeleteDialogOpen(false);
    startTransition(async () => {
      await deleteMediaItemAction(formData);
      router.refresh();
    });
  };

  function handleConfirmDelete() {
    const formData = new FormData();
    formData.set("itemId", item.id);
    handleDelete(formData);
  }

  const displayUrl =
    item.posterUrl ??
    (item.image_url?.startsWith(STORAGE_PATH_PREFIX) ? null : item.image_url) ??
    null;

  const cardBody = (
    <motion.div
      className={`media-card flex h-[420px] flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-900 cursor-pointer transition-opacity duration-150 hover:shadow-lg ${isNavigating ? "opacity-80" : ""}`}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
    >
      <PosterImage imageUrl={displayUrl} title={item.title} mediaType={item.media_type} />
      <div className="p-3">
        <h3 className="text-sm font-medium leading-tight line-clamp-1 mt-2">
          {item.title}
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] px-2 py-1 rounded bg-zinc-800 text-white/70">
            {item.status}
          </span>
          {item.rating != null && (
            <span className="text-[10px] text-yellow-400">
              ★ {item.rating}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <MediaDetailModal
        item={item}
        isLibrary
        onEdit={() => handleEditClick()}
        onDelete={() => setDeleteDialogOpen(true)}
        onOpenRequest={() => setIsNavigating(true)}
        onClose={() => setIsNavigating(false)}
      >
        {cardBody}
      </MediaDetailModal>
      {!onEdit && (
        <EditMediaModal
          item={item}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSuccess={() => {
            setEditOpen(false);
            router.refresh();
          }}
        />
      )}
      <ConfirmDialog
        open={deleteDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        title="Delete media item"
        description="Are you sure you want to delete this item?"
      />
    </>
  );
}
