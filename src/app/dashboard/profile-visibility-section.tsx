import type { Profile } from "@/lib/db-types";
import { updateProfileVisibilityAction } from "./actions";
import { CopyLinkButton } from "./copy-link-button";

export function ProfileVisibilitySection({
  profile,
  baseUrl,
}: {
  profile: Profile;
  baseUrl: string;
}) {
  const isPublic = profile.is_public === true;
  const publicUrl = `${baseUrl}/u/${profile.username}`;

  return (
    <section>
      <h2 className="mb-3 text-lg font-medium">Profile visibility</h2>
      {isPublic ? (
        <>
          <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
            Your profile is public. Anyone with the link can view your media list.
          </p>
          <p className="mb-3 font-mono text-sm">
            Public URL:{" "}
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline dark:text-blue-400"
            >
              {publicUrl}
            </a>
          </p>
          <p className="mb-3">
            <CopyLinkButton url={publicUrl} />
          </p>
          <form action={updateProfileVisibilityAction}>
            <input type="hidden" name="is_public" value="false" />
            <button
              type="submit"
              className="rounded bg-zinc-200 px-3 py-1.5 text-sm font-medium hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
            >
              Make profile private
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
            Your profile is private.
          </p>
          <form action={updateProfileVisibilityAction}>
            <input type="hidden" name="is_public" value="true" />
            <button
              type="submit"
              className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Make profile public
            </button>
          </form>
        </>
      )}
    </section>
  );
}
