import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              if (value === "") {
                cookieStore.delete(name);
              } else {
                cookieStore.set(name, value, options);
              }
            });
          } catch {
            // Ignore in Server Component context where set is not allowed
          }
        },
      },
    },
  );
}

/**
 * Get the current user and supabase client. On invalid/expired refresh token,
 * clears the session and returns null so the app can redirect to login.
 */
export async function getServerUser(): Promise<{
  user: User | null;
  supabase: SupabaseClient;
}> {
  const supabase = await createClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { user, supabase };
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    const isInvalidToken =
      code === "refresh_token_not_found" || code === "invalid_refresh_token";
    if (isInvalidToken) {
      await supabase.auth.signOut();
    }
    return { user: null, supabase };
  }
}
