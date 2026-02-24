import { redirect } from "next/navigation";
import { createClient, getServerUser } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/profile";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthHeroLogin } from "@/components/auth/auth-hero";
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

export default async function LoginPage() {
  const { user } = await getServerUser();
  if (user) redirect("/library");

  return (
    <div className="cinematic-auth">
      <div className="auth-bg" aria-hidden />
      <AuthHeader />
      <main role="main" className="auth-main">
        <AuthHeroLogin />
        <section aria-label="Sign in form" className="auth-form-section">
          <LoginForm action={loginAction} />
        </section>
      </main>
    </div>
  );
}
