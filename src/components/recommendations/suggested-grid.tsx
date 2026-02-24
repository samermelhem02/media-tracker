"use client";

import { SuggestedCard } from "@/components/recommendations/suggested-card";
import type { EnrichedRecommendation } from "@/lib/enrich-recommendations";
import type { ExploreMediaItem } from "@/components/ExploreMediaModal";

type AddFromRecommendationAction = (formData: FormData) => Promise<void>;

function normalizeTitle(title: string | null | undefined): string {
  return (title ?? "").trim().toLowerCase();
}

export function SuggestedGrid({
  suggested,
  action,
  onSelectItem,
  libraryTitles,
}: {
  suggested: EnrichedRecommendation[];
  action: AddFromRecommendationAction;
  onSelectItem: (item: ExploreMediaItem) => void;
  libraryTitles?: Set<string>;
}) {
  if (suggested.length === 0) {
    return (
      <section>
        <h2 className="mt-section-heading">Suggested for you</h2>
        <p className="mt-text-muted">
          No suggestions yet. Add items to your library to get personalized
          recommendations.
        </p>
      </section>
    );
  }
  return (
    <section>
      <h2 className="mt-section-heading">Suggested for you</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suggested.map((rec) => (
          <SuggestedCard
            key={rec.id}
            rec={rec}
            action={action}
            onSelectItem={onSelectItem}
            isInLibrary={libraryTitles?.has(normalizeTitle(rec.title))}
          />
        ))}
      </div>
    </section>
  );
}
