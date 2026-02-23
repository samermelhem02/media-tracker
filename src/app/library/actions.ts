"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deleteMediaItem } from "@/lib/media-items";
import { clearCached } from "@/lib/recommendation-cache";

export async function deleteMediaItemAction(formData: FormData): Promise<void> {
  const itemId = formData.get("itemId") as string;
  if (!itemId) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await deleteMediaItem(supabase, user.id, itemId);
  clearCached(user.id);
  revalidatePath("/library");
}
