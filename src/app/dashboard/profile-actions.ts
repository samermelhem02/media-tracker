"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileNameResult = { success?: string; error?: string };

export async function updateProfileNameAction(
  _prevState: ProfileNameResult,
  formData: FormData,
): Promise<ProfileNameResult> {
  const firstName = (formData.get("first_name") as string)?.trim() ?? null;
  const lastName = (formData.get("last_name") as string)?.trim() ?? null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ first_name: firstName || null, last_name: lastName || null })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/library");
  return { success: "Profile saved." };
}
