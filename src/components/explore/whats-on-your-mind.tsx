"use client";

import { useState } from "react";
import { whatsOnYourMindRecommendationsAction } from "@/app/dashboard/ai-recommendations-actions";
import { SuggestedCard } from "@/components/recommendations/suggested-card";
import { ExploreSectionCarousel } from "@/components/explore/explore-section-carousel";
import type { EnrichedRecommendation } from "@/lib/enrich-recommendations";
import type { ExploreMediaItem } from "@/components/ExploreMediaModal";

const MAX_LENGTH = 200;
const PLACEHOLDER = "e.g. something cozy for a rainy day, or I need to unwind after work…";

type AddFromRecommendationAction = (formData: FormData) => Promise<void>;

function normalizeTitle(title: string | null | undefined): string {
  return (title ?? "").trim().toLowerCase();
}

type WhatsOnYourMindProps = {
  addFromRecommendationAction: AddFromRecommendationAction;
  onSelectItem: (item: ExploreMediaItem) => void;
  libraryTitles: Set<string>;
};

export function WhatsOnYourMind({
  addFromRecommendationAction,
  onSelectItem,
  libraryTitles,
}: WhatsOnYourMindProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<EnrichedRecommendation[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    formData.set("prompt", prompt.trim());
    setLoading(true);
    try {
      const result = await whatsOnYourMindRecommendationsAction(formData);
      if (result.error) {
        setError(result.error);
        setSuggestions([]);
      } else {
        setSuggestions(result.suggestions);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="mt-section-heading">What&apos;s on your mind?</h2>
        <span className="text-xs font-medium text-yellow-400/90">Powered by AI</span>
      </div>
      <p className="text-sm text-[var(--mt-text-muted)] max-w-xl">
        Tell us in a few words—we&apos;ll suggest something to watch, listen to, or play.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            name="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, MAX_LENGTH))}
            placeholder={PLACEHOLDER}
            maxLength={MAX_LENGTH}
            disabled={loading}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 disabled:opacity-60"
            aria-label="What's on your mind"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="shrink-0 rounded-lg bg-white/15 px-5 py-3 font-medium text-white hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Finding picks…" : "Get picks"}
        </button>
      </form>
      <p className="mt-1 text-xs text-[var(--mt-text-muted)]">
        {prompt.length}/{MAX_LENGTH}
      </p>
      {error && (
        <p className="text-sm text-amber-400/90" role="alert">
          {error}
        </p>
      )}
      {suggestions.length > 0 && (
        <div className="pt-2">
          <p className="mb-3 text-sm text-[var(--mt-text-muted)]">
            Here&apos;s what fits—add any to your library.
          </p>
          <ExploreSectionCarousel title="">
            {suggestions.map((rec) => (
              <SuggestedCard
                key={rec.id}
                rec={rec}
                action={addFromRecommendationAction}
                onSelectItem={onSelectItem}
                isInLibrary={libraryTitles.has(normalizeTitle(rec.title))}
              />
            ))}
          </ExploreSectionCarousel>
        </div>
      )}
    </section>
  );
}
