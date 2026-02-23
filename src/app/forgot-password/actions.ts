"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; success?: string };

const initialState: ActionState = {};

export async function sendPasswordResetAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = (formData.get("email") as string)?.trim();
  if (!email) return { error: "Email is required" };

  const headersList = await headers();
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  const host = headersList.get("host") ?? "localhost:3000";
  const origin = `${proto}://${host}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) return { error: error.message };
  return { success: "Check your email for a reset link" };
}
