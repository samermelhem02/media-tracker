import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile, getProfileForUser } from "@/lib/profile";
import { listMediaItems } from "@/lib/media-items";
import { getCachedPosterUrl } from "@/lib/poster-url-cache";
import { STORAGE_PATH_PREFIX } from "@/lib/storage";
import { TopNav } from "@/components/dashboard/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { DashboardStats } from "@/app/dashboard/dashboard-stats";
import { SuccessToast } from "@/components/ui/success-toast";
import { LibraryView } from "./library-view";
import type { MediaItem } from "@/lib/db-types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; status?: string; media_type?: string }>;

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await ensureProfile(supabase, user);
  if (!(await getProfileForUser(supabase, user.id))) redirect("/login");

  const params = await searchParams;
  const filters = {
    q: params.q ?? undefined,
    status: params.status ?? undefined,
    mediaType: params.media_type ?? undefined,
  };

  const rawItems = await listMediaItems(supabase, user.id, filters);

  const items: (MediaItem & { posterUrl?: string | null })[] = await Promise.all(
    rawItems.map(async (item) => {
      if (item.image_url?.startsWith(STORAGE_PATH_PREFIX)) {
        const path = item.image_url.slice(STORAGE_PATH_PREFIX.length);
        const posterUrl = await getCachedPosterUrl(supabase, path, 3600);
        return { ...item, posterUrl: posterUrl ?? null };
      }
      return { ...item, posterUrl: null };
    })
  );

  const totalItems = items.length;
  const completedItems = items.filter((i) => i.status === "completed").length;
  const withRating = items.filter((i) => i.rating != null && i.rating > 0);
  const averageRating =
    withRating.length > 0
      ? withRating.reduce((s, i) => s + (i.rating ?? 0), 0) / withRating.length
      : 0;

  return (
    <div className="relative min-h-screen px-4 py-8">
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-xl"
          style={{
            backgroundImage: "url('/cinema-bg.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <div className="relative z-10 animate-fadeIn">
        <TopNav user={user} />
        <main className="mx-auto max-w-6xl pt-8">
          <GlassCard className="mb-6 p-6">
            <DashboardStats
              totalItems={totalItems}
              completedItems={completedItems}
              averageRating={averageRating}
            />
          </GlassCard>
          <LibraryView
            initialItems={items}
            initialQ={params.q}
            initialStatus={params.status}
            initialMediaType={params.media_type}
          />
      </main>
      </div>
    </div>
  );
}
