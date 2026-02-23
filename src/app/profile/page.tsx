import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile, getProfileForUser } from "@/lib/profile";
import { TopNav } from "@/components/dashboard/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { ProfileVisibilitySection } from "@/app/dashboard/profile-visibility-section";
import { ProfileSettingsSection } from "@/app/dashboard/profile-settings-section";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await ensureProfile(supabase, user);
  const profile = await getProfileForUser(supabase, user.id);
  if (!profile) redirect("/login");

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;

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
        <GlassCard className="mb-6 p-6">
            <ProfileVisibilitySection profile={profile} baseUrl={baseUrl} />
          </GlassCard>
          <GlassCard className="p-6">
            <ProfileSettingsSection profile={profile} />
          </GlassCard>
      </main>
      </div>
    </div>
  );
}
