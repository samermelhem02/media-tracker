"use client";

import { useActionState, useEffect, useState } from "react";
import type { MediaItem } from "@/lib/db-types";
import { MEDIA_TYPES, MEDIA_STATUSES } from "@/lib/db-types";
import { STORAGE_PATH_PREFIX } from "@/lib/storage";
import type { UpdateResult } from "@/app/actions/media-actions";
import { updateMediaItemAction } from "@/app/actions/media-actions";

export function EditMediaForm({
  item,
  onDone,
  onSuccess,
}: {
  item: MediaItem;
  onDone?: () => void;
  onSuccess?: (updatedItem?: MediaItem) => void;
}) {
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [removePoster, setRemovePoster] = useState(false);

  const [state, formAction] = useActionState(
    updateMediaItemAction,
    undefined as UpdateResult | void,
  );

  useEffect(() => {
    if (state != null && !state.error && state.item) {
      onSuccess?.(state.item);
    }
  }, [state, onSuccess]);

  const inputClass =
    "rounded border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 w-full";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      {state?.error && (
        <p className="mb-3 rounded bg-red-900/30 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      )}
      <form
        action={formAction}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <input type="hidden" name="itemId" value={item.id} />
        <input type="hidden" name="remove_poster" value={removePoster ? "true" : "false"} />
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            name="title"
            type="text"
            required
            minLength={2}
            defaultValue={item.title}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Type</label>
          <select
            name="media_type"
            defaultValue={item.media_type}
            className={inputClass}
          >
            {MEDIA_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select
            name="status"
            defaultValue={item.status}
            className={inputClass}
          >
            {MEDIA_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Rating (1–10)</label>
          <input
            name="rating"
            type="number"
            min={1}
            max={10}
            step={1}
            defaultValue={item.rating ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Creator</label>
          <input
            name="creator"
            type="text"
            defaultValue={item.creator ?? ""}
            placeholder="Director / Artist / Studio"
            className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Genre</label>
          <input
            name="genre"
            type="text"
            defaultValue={item.genre ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Tags (comma-separated)
          </label>
          <input
            name="tags"
            type="text"
            defaultValue={Array.isArray(item.tags) ? item.tags.join(", ") : ""}
            placeholder="a, b, c"
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">
            Poster image (optional)
          </label>
          <input
            name="poster_file"
            type="file"
            accept="image/*"
            className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 file:mr-2 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-sm file:text-zinc-200"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (posterPreview?.startsWith("blob:")) URL.revokeObjectURL(posterPreview);
              setRemovePoster(false);
              setPosterPreview(f ? URL.createObjectURL(f) : null);
            }}
          />
          {(() => {
            const previewSrc = removePoster
              ? ""
              : posterPreview
                ? posterPreview
                : (item as { posterUrl?: string | null }).posterUrl
                  ? (item as { posterUrl?: string | null }).posterUrl ?? ""
                  : item.image_url && !item.image_url.startsWith(STORAGE_PATH_PREFIX)
                    ? item.image_url
                    : "";
            return previewSrc ? (
              <div className="mt-2 h-36 w-24 overflow-hidden rounded-lg border border-white/10 bg-zinc-800">
                <img src={previewSrc} alt="Poster preview" className="h-full w-full object-cover" />
              </div>
            ) : null;
          })()}
          <div className="mt-2 flex flex-wrap gap-2">
            {(posterPreview || item.image_url) && !removePoster && (
              <button
                type="button"
                onClick={() => {
                  if (posterPreview?.startsWith("blob:")) URL.revokeObjectURL(posterPreview);
                  setRemovePoster(true);
                  setPosterPreview(null);
                }}
                className="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
              >
                Remove poster
              </button>
            )}
            {removePoster && (
              <button
                type="button"
                onClick={() => {
                  setRemovePoster(false);
                }}
                className="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
              >
                Undo remove
              </button>
            )}
          </div>
          <input type="hidden" name="image_url" value={removePoster ? "" : (item.image_url ?? "")} />
        </div>
        {/* Description (Read-only) */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={item.description ?? ""}
            readOnly
            disabled
            rows={3}
            className="w-full resize-none rounded-md bg-zinc-800 p-3 text-zinc-400"
          />
        </div>

        {/* Review (User editable) */}
        <div className="md:col-span-2 mt-4">
          <label className="mb-1 block text-sm font-medium">Your Review</label>
          <textarea
            name="review"
            rows={3}
            defaultValue={item.review ?? ""}
            placeholder="Write your thoughts..."
            className="w-full resize-none rounded-md bg-zinc-900 p-3"
          />
        </div>
        <div className="flex gap-2 md:col-span-2">
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/30"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
