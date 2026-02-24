import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUsername } from "@/lib/profile";
import { listMediaItems } from "@/lib/media-items";
import { PublicProfileView } from "./public-profile-view";

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
    <PublicProfileView profile={profile} items={items} />
  );
}
