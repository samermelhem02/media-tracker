import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "./db-types";

const MAX_USERNAME_RETRIES = 10;

function emailPrefix(email: string): string {
  const part = email.split("@")[0] ?? "user";
  return part.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 32) || "user";
}

function randomSuffix(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Ensures a profiles row exists for the user. If missing, inserts one with a
 * unique username (email prefix + random 4 digits). Retries on unique violation.
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<void> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  const baseName = emailPrefix(user.email ?? "user");

  for (let attempt = 0; attempt < MAX_USERNAME_RETRIES; attempt++) {
    const username = `${baseName}_${randomSuffix()}`;
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      username,
      display_name: null,
    });

    if (!error) return;
    if (error.code === "23505") continue; // unique_violation
    throw error;
  }

  throw new Error("Could not create a unique profile username");
}

/**
 * Fetches profile by user id (for current user).
 */
export async function getProfileForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, first_name, last_name, is_public, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

/**
 * Fetches profile by username (for public profile page).
 */
export async function getProfileByUsername(
  supabase: SupabaseClient,
  username: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, first_name, last_name, is_public, created_at, updated_at")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

/**
 * Updates is_public for the given user's profile.
 */
export async function updateProfileVisibility(
  supabase: SupabaseClient,
  userId: string,
  isPublic: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ is_public: isPublic })
    .eq("id", userId);
  if (error) throw error;
}
