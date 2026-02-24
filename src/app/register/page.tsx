import { redirect } from "next/navigation";
import { createClient, getServerUser } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/profile";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthHeroRegister } from "@/components/auth/auth-hero";
import { RegisterForm } from "./register-form";

async function registerAction(formData: FormData) {
  "use server";
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }
  if (data.user && data.session) {
    await ensureProfile(supabase, data.user);
    redirect("/library");
  }
  return {
    message: "Check your email to confirm your account, then sign in.",
  };
}

export default async function RegisterPage() {
  const { user } = await getServerUser();
  if (user) redirect("/library");

  return (
    <div className="cinematic-auth">
      <div className="auth-bg" aria-hidden />
      <AuthHeader />
      <main role="main" className="auth-main">
        <AuthHeroRegister />
        <section aria-label="Create account form" className="auth-form-section">
          <RegisterForm action={registerAction} />
        </section>
      </main>
    </div>
  );
}
