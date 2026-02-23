import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/library");

  return (
    <div className="cinematic-auth">
      <AuthHeader />

      <main role="main" style={{ padding: "48px 24px 64px" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
            alignItems: "center",
          }}
          className="auth-two-column"
        >
          <section aria-label="Sign in form" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <LoginForm action={loginAction} />
          </section>

          <section aria-label="Benefits" className="auth-benefits">
            <div className="auth-benefit-list" style={{ maxWidth: "400px" }}>
              {BENEFITS.map((b, i) => (
                <div key={i}>
                  <h3>{b.title}</h3>
                  <p>{b.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
