"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateProfileVisibility } from "@/lib/profile";

export async function updateProfileVisibilityAction(
  formData: FormData,
): Promise<void> {
  const isPublicRaw = formData.get("is_public");
  const isPublic = isPublicRaw === "true";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await updateProfileVisibility(supabase, user.id, isPublic);
  revalidatePath("/library");
}
