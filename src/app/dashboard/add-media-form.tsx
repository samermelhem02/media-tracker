"use client";

import { useActionState, useState, useEffect } from "react";
import type { MediaItem } from "@/lib/db-types";
import { MEDIA_TYPES, MEDIA_STATUSES } from "@/lib/db-types";
import { createMediaItemAction } from "@/app/actions/media-actions";
import type { CreateResult } from "@/app/actions/media-actions";
import { generateMetadataAction } from "./ai-actions";

const STORAGE_KEY_TITLE = "media-tracker-add-title";
const STORAGE_KEY_TYPE = "media-tracker-add-type";

type AIMetadataState = {
  genre?: string;
  description?: string;
  creator?: string;
  rating?: number;
  tags?: string[];
  error?: string;
};

const aiInitialState: AIMetadataState = {
  genre: "",
  description: "",
  creator: "",
  rating: undefined,
  tags: [],
  error: undefined,
};

function getStoredTitle(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(STORAGE_KEY_TITLE) ?? "";
}

function getStoredMediaType(): string {
  if (typeof window === "undefined") return MEDIA_TYPES[0] ?? "movie";
  const stored = sessionStorage.getItem(STORAGE_KEY_TYPE);
  return MEDIA_TYPES.includes(stored as (typeof MEDIA_TYPES)[number])
    ? stored!
    : MEDIA_TYPES[0] ?? "movie";
}

export function AddMediaForm({
  onSuccess,
}: { onSuccess?: (item?: MediaItem) => void } = {}) {
  const [state, formAction] = useActionState(
    async (_: CreateResult | void, formData: FormData) =>
      createMediaItemAction(formData),
    undefined as CreateResult | void,
  );

  const [aiState, aiFormAction, isPending] = useActionState(
    async (_prev: AIMetadataState, formData: FormData) =>
      generateMetadataAction(formData),
    aiInitialState,
  );

  // Single source of truth for title and type (shared by AI mini-form and Add form).
  // Restore from sessionStorage in initializers so selection survives remounts after AI submit.
  const [title, setTitle] = useState(() => getStoredTitle());
  const [mediaType, setMediaType] = useState<string>(() => getStoredMediaType());
  const [status, setStatus] = useState<string>(MEDIA_STATUSES[0] ?? "wishlist");
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY_TITLE, title);
  }, [title]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY_TYPE, mediaType);
  }, [mediaType]);

  useEffect(() => {
    if (state != null && !state.error && state.item) {
      onSuccess?.(state.item);
    }
  }, [state, onSuccess]);

  const hasAiResult =
    aiState && !aiState.error && aiState.genre !== undefined;
  const aiAutofillKey = hasAiResult
    ? `${aiState.genre}-${aiState.rating}-${(aiState.tags ?? []).join(",")}`
    : "empty";
  const defaultGenre = hasAiResult ? (aiState.genre ?? "") : "";
  const defaultDescription = hasAiResult ? (aiState.description ?? (aiState as { review?: string }).review ?? "") : "";
  const defaultCreator = hasAiResult ? (aiState.creator ?? "") : "";
  const defaultRating =
    hasAiResult && aiState.rating !== undefined ? String(aiState.rating) : "";
  const defaultTags =
    hasAiResult && Array.isArray(aiState.tags)
      ? aiState.tags.join(", ")
      : "";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      {/* AI mini-form: same title + type as Add form */}
      <div className="mb-4 rounded border border-white/10 p-4">
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          Generate genre, description, rating, and tags from title and type.
        </p>
        <form action={aiFormAction} className="flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="ai-title"
              className="mb-1 block text-sm font-medium"
            >
              Title (required for AI)
            </label>
            <input
              id="ai-title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-48 rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label htmlFor="ai-type" className="mb-1 block text-sm font-medium">
              Type
            </label>
            <select
              id="ai-type"
              name="type"
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {MEDIA_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={!title.trim() || isPending}
            className="rounded bg-zinc-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-600 disabled:opacity-50 dark:bg-zinc-600 dark:hover:bg-zinc-500"
          >
            {isPending ? "Generating..." : "Generate with AI"}
          </button>
        </form>
        {aiState?.error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {aiState.error}
          </p>
        )}
      </div>

      {/* Add Media form: title and type shared with AI form */}
      {state?.error && (
        <p className="mb-3 rounded bg-red-900/30 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      )}
      <form
        action={formAction}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <div>
          <label htmlFor="add-title" className="mb-1 block text-sm font-medium">
            Title *
          </label>
          <input
            id="add-title"
            name="title"
            type="text"
            required
            minLength={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100"
          />
        </div>
        <div>
          <label
            htmlFor="add-media_type"
            className="mb-1 block text-sm font-medium"
          >
            Type *
          </label>
          <select
            id="add-media_type"
            name="media_type"
            required
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100"
          >
            {MEDIA_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="add-status" className="mb-1 block text-sm font-medium">
            Status *
          </label>
          <select
            id="add-status"
            name="status"
            required
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100"
          >
            {MEDIA_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {/* Only this block remounts when AI result changes */}
        <div key={aiAutofillKey} className="contents">
          <div>
            <label htmlFor="add-rating" className="mb-1 block text-sm font-medium">
              Rating (1–10)
            </label>
            <input
              id="add-rating"
              name="rating"
              type="number"
              min={1}
              max={10}
              step={1}
              defaultValue={defaultRating}
              className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100"
            />
          </div>
          <div>
            <label htmlFor="add-genre" className="mb-1 block text-sm font-medium">
              Genre
            </label>
            <input
              id="add-genre"
              name="genre"
              type="text"
              defaultValue={defaultGenre}
              className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100"
            />
          </div>
          <div>
            <label htmlFor="add-creator" className="mb-1 block text-sm font-medium">
              Creator
            </label>
            <input
              id="add-creator"
              name="creator"
              type="text"
              defaultValue={defaultCreator}
              placeholder="Director / Artist / Studio"
              className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100"
            />
          </div>
          <div>
            <label htmlFor="add-tags" className="mb-1 block text-sm font-medium">
              Tags (comma-separated)
            </label>
            <input
              id="add-tags"
              name="tags"
              type="text"
              placeholder="a, b, c"
              defaultValue={defaultTags}
              className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100"
            />
          </div>
          {/* Description (AI fills this; review stays empty) */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={defaultDescription}
              placeholder="Short description of the movie / game / music..."
              className="w-full resize-none rounded-md bg-zinc-900 p-3 text-zinc-100"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="add-review" className="mb-1 block text-sm font-medium">
              Review
            </label>
            <textarea
              id="add-review"
              name="review"
              rows={3}
              defaultValue=""
              placeholder="Write your thoughts..."
              className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">
              Poster image (optional)
            </label>
            <input
              id="add-poster_file"
              name="poster_file"
              type="file"
              accept="image/*"
              className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 file:mr-2 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-sm file:text-zinc-200"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (posterPreview) URL.revokeObjectURL(posterPreview);
                setPosterPreview(f ? URL.createObjectURL(f) : null);
              }}
            />
            {posterPreview && (
              <div className="mt-2 aspect-[2/3] w-24 overflow-hidden rounded-lg border border-white/10 bg-zinc-800">
                <img
                  src={posterPreview}
                  alt="Poster preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/30"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
