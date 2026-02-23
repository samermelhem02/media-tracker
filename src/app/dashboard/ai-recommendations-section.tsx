"use client";

import { useActionState } from "react";
import { generateRecommendationsAction } from "./ai-recommendations-actions";
import type { RecommendationsResult } from "./ai-recommendations-actions";

const initialState: RecommendationsResult = {
  recommendations: [],
};

export function AIRecommendationsSection() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: RecommendationsResult, _formData: FormData) =>
      generateRecommendationsAction(),
    initialState,
  );

  return (
    <section>
      <h2 className="mb-3 text-lg font-medium">AI Recommendations</h2>
      <form action={formAction} className="mb-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-zinc-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-600 disabled:opacity-50 dark:bg-zinc-600 dark:hover:bg-zinc-500"
        >
          {isPending ? "Generating..." : "Generate recommendations"}
        </button>
      </form>
      {state?.error && (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state?.recommendations && state.recommendations.length > 0 && (
        <ul className="space-y-3">
          {state.recommendations.map((rec, i) => (
            <li
              key={`${rec.title}-${rec.media_type}-${i}`}
              className="rounded border border-zinc-100 p-3 dark:border-zinc-700/50"
            >
              <p className="font-medium">
                {rec.title}
                <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">
                  ({rec.media_type})
                </span>
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {rec.why}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
