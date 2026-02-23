import { redirect } from "next/navigation";
import { createClient, getServerUser } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/profile";
import { AuthHeader } from "@/components/auth/auth-header";
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
      <AuthHeader />

      <main role="main" className="px-4 py-8 sm:px-6 sm:py-12 md:px-8">
        <div className="mx-auto flex max-w-[1200px] justify-center">
          <section aria-label="Create account form">
            <RegisterForm action={registerAction} />
          </section>
        </div>
      </main>
    </div>
  );
}
