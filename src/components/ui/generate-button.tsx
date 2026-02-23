"use client";

import { useFormStatus } from "react-dom";

export function GenerateButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-zinc-800 px-4 py-2 text-sm transition hover:bg-zinc-700 disabled:opacity-50"
    >
      {pending ? "Generating..." : "Generate Recommendations"}
    </button>
  );
}
