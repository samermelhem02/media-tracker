"use client";

import { useActionState } from "react";
import type { Profile } from "@/lib/db-types";
import { updateProfileNameAction } from "./profile-actions";
import type { ProfileNameResult } from "./profile-actions";

const initialState: ProfileNameResult = {};

export function ProfileSettingsSection({ profile }: { profile: Profile }) {
  const [state, formAction, isPending] = useActionState(
    updateProfileNameAction,
    initialState,
  );

  return (
    <section>
      <h2 className="mb-3 text-lg font-medium">Profile settings</h2>
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor="profile-first_name"
            className="mb-1 block text-sm font-medium"
          >
            First name
          </label>
          <input
            id="profile-first_name"
            name="first_name"
            type="text"
            defaultValue={profile.first_name ?? ""}
            className="w-48 rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <label
            htmlFor="profile-last_name"
            className="mb-1 block text-sm font-medium"
          >
            Last name
          </label>
          <input
            id="profile-last_name"
            name="last_name"
            type="text"
            defaultValue={profile.last_name ?? ""}
            className="w-48 rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </form>
      {state?.success && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
          {state.success}
        </p>
      )}
      {state?.error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </section>
  );
}
