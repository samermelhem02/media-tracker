"use client";

import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(url);
      setFeedback("Copied!");
      setTimeout(() => setFeedback(null), 2000);
    } catch {
      setFeedback("Copy failed");
      setTimeout(() => setFeedback(null), 2000);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        className="rounded bg-zinc-200 px-3 py-1.5 text-sm font-medium hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
      >
        Copy link
      </button>
      {feedback && (
        <span
          className={
            feedback === "Copied!"
              ? "text-sm text-green-600 dark:text-green-400"
              : "text-sm text-red-600 dark:text-red-400"
          }
        >
          {feedback}
        </span>
      )}
    </span>
  );
}
