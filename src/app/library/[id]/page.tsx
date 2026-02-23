import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile, getProfileForUser } from "@/lib/profile";
import { getMediaItem } from "@/lib/media-items";
import { getCachedPosterUrl } from "@/lib/poster-url-cache";
import { resolvePosterUrl } from "@/lib/images";
import { STORAGE_PATH_PREFIX } from "@/lib/storage";
import { TopNav } from "@/components/dashboard/top-nav";
import { GlassCard } from "@/components/ui/glass-card";

export default async function LibraryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  await ensureProfile(supabase, user);
  if (!(await getProfileForUser(supabase, user.id))) notFound();

  const { id } = await params;
  const item = await getMediaItem(supabase, user.id, id);
  if (!item) notFound();

  let posterUrl: string | null = null;
  if (item.image_url?.startsWith(STORAGE_PATH_PREFIX)) {
    const path = item.image_url.slice(STORAGE_PATH_PREFIX.length);
    posterUrl = await getCachedPosterUrl(supabase, path, 3600);
  } else if (item.image_url) {
    posterUrl = item.image_url;
  }
  const displayPosterUrl = resolvePosterUrl(posterUrl, item.media_type);

  const tagsList = Array.isArray(item.tags) ? item.tags : [];

  return (
    <div className="relative min-h-screen px-4 py-8">
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-xl"
          style={{ backgroundImage: "url('/cinema-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <div className="relative z-10 animate-fadeIn">
        <TopNav user={user} />
        <main className="mx-auto max-w-4xl pt-8">
            <Link
              href="/library"
              className="mb-6 inline-block text-sm text-zinc-400 hover:text-white"
            >
              ← Back to Library
            </Link>
            <GlassCard className="overflow-hidden p-0">
              <div className="flex flex-col md:flex-row">
                <div className="aspect-[2/3] w-full md:w-72 md:shrink-0 overflow-hidden">
                  <img
                    src={displayPosterUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 p-6">
                  <h1 className="text-2xl font-semibold text-white">
                    {item.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded bg-white/20 px-2 py-0.5 text-sm text-white">
                      {item.media_type}
                    </span>
                    <span className="rounded bg-white/20 px-2 py-0.5 text-sm text-white">
                      {item.status}
                    </span>
                    {item.rating != null && (
                      <span className="rounded bg-white/20 px-2 py-0.5 text-sm text-white">
                        ★ {item.rating}
                      </span>
                    )}
                  </div>
                  {item.genre && (
                    <p className="mt-3 text-sm text-zinc-400">
                      <span className="font-medium text-zinc-300">Genre:</span>{" "}
                      {item.genre}
                    </p>
                  )}
                  {tagsList.length > 0 && (
                    <p className="mt-1 text-sm text-zinc-400">
                      <span className="font-medium text-zinc-300">Tags:</span>{" "}
                      {tagsList.join(", ")}
                    </p>
                  )}
                  {item.review && (
                    <div className="mt-4">
                      <h2 className="text-sm font-medium text-zinc-300">
                        Review / Overview
                      </h2>
                      <p className="mt-1 text-sm text-zinc-400 whitespace-pre-wrap">
                        {item.review}
                      </p>
                    </div>
                  )}
                  <div className="mt-6 flex gap-3">
                    <Link
                      href="/library"
                      className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
                    >
                      Edit in Library
                    </Link>
                    <Link
                      href="/library"
                      className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10"
                    >
                      Back to Library
                    </Link>
                  </div>
                </div>
              </div>
            </GlassCard>
        </main>
      </div>
    </div>
  );
}
