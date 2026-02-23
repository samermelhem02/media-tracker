import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUsername } from "@/lib/profile";
import { listMediaItems } from "@/lib/media-items";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();
  const profile = await getProfileByUsername(supabase, username);

  if (!profile) notFound();

  if (profile.is_public !== true) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <h1 className="text-xl font-semibold">
          {profile.display_name || profile.username}
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          This profile is private.
        </p>
        <Link
          href="/"
          className="mt-6 text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const items = await listMediaItems(supabase, profile.id);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="border-b border-zinc-200 pb-4 dark:border-zinc-700">
          <h1 className="text-xl font-semibold">
            {profile.display_name || profile.username}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            @{profile.username}
          </p>
        </header>
        <main className="pt-6">
          <h2 className="mb-4 text-lg font-medium">Media</h2>
          {items.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No media items yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-700">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                    <th className="p-3 font-medium">Title</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-zinc-100 dark:border-zinc-700/50"
                    >
                      <td className="p-3">{item.title}</td>
                      <td className="p-3">{item.media_type}</td>
                      <td className="p-3">{item.status}</td>
                      <td className="p-3">{item.rating ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
        <p className="mt-8">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
          >
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
