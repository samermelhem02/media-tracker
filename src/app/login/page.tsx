import { redirect } from "next/navigation";
import { createClient, getServerUser } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/profile";
import { AuthHeader } from "@/components/auth/auth-header";
import { LoginForm } from "./login-form";

async function loginAction(formData: FormData) {
  "use server";
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }
  if (data.user) {
    await ensureProfile(supabase, data.user);
  }
  redirect("/library");
}

const BENEFITS = [
  {
    title: "Track your collection",
    description: "Keep movies, series, music, and games in one place with status and notes.",
  },
  {
    title: "Discover recommendations",
    description: "Get personalized suggestions and explore trending titles by category.",
  },
  {
    title: "Your library, anywhere",
    description: "Access your list from any device. Simple, fast, and private.",
  },
];

export default async function LoginPage() {
  const { user } = await getServerUser();
  if (user) redirect("/library");

  return (
    <div className="cinematic-auth">
      <AuthHeader />

      <main role="main" className="px-4 py-8 sm:px-6 sm:py-12 md:px-8">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
          <section aria-label="Sign in form" className="flex justify-center w-full order-1">
            <LoginForm action={loginAction} />
          </section>

          <section aria-label="Benefits" className="auth-benefits order-2 md:order-none">
            <div className="auth-benefit-list mx-auto max-w-[400px] text-center md:text-left">
              {BENEFITS.map((b, i) => (
                <div key={i}>
                  <h3 className="text-sm font-semibold text-[var(--auth-text)]">{b.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--auth-text-muted)]">{b.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
