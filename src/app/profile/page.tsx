import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerUser } from "@/lib/supabase/server";
import { ensureProfile, getProfileForUser } from "@/lib/profile";
import { TopNav } from "@/components/dashboard/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { ProfileVisibilitySection } from "@/app/dashboard/profile-visibility-section";
import { ProfileSettingsSection } from "@/app/dashboard/profile-settings-section";

export default async function ProfilePage() {
  const { user, supabase } = await getServerUser();

  if (!user) redirect("/login");

  await ensureProfile(supabase, user);
  const profile = await getProfileForUser(supabase, user.id);
  if (!profile) redirect("/login");

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;

  return (
    <div className="relative min-h-screen px-4 py-6 sm:px-5 sm:py-8 md:px-6">
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-xl"
          style={{ backgroundImage: "url('/cinema-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <div className="relative z-10 animate-fadeIn">
      <TopNav user={user} profile={profile} />
      <main className="mx-auto w-full max-w-4xl min-w-0 pt-6 sm:pt-8 px-1 sm:px-0">
        <GlassCard className="mb-4 p-4 sm:mb-6 sm:p-6">
            <ProfileVisibilitySection profile={profile} baseUrl={baseUrl} />
          </GlassCard>
          <GlassCard className="mb-4 p-4 sm:mb-6 sm:p-6">
            <ProfileSettingsSection profile={profile} />
          </GlassCard>
          <GlassCard className="p-4 sm:p-6">
            <h2 className="mb-3 text-lg font-medium text-white">Account</h2>
            {user.email && (
              <p className="mb-4 text-sm text-zinc-400">
                <span className="font-medium text-zinc-300">Email</span>{" "}
                <span className="break-all">{user.email}</span>
              </p>
            )}
            <form action="/logout" method="post">
              <button
                type="submit"
                className="rounded-lg bg-red-600/80 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500/90 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                Sign out
              </button>
            </form>
          </GlassCard>
      </main>
      </div>
    </div>
  );
}
