import { createHash } from "crypto";

export type LibraryItemForFingerprint = {
  id: string;
  title: string | null;
  media_type: string | null;
  creator?: string | null;
  release_date?: string | null;
  status?: string | null;
};

export function buildLibraryFingerprint(
  items: LibraryItemForFingerprint[],
): string {
  const sorted = [...items].sort((a, b) => (a.id < b.id ? -1 : 1));
  const joined = sorted
    .map(
      (item) =>
        `${item.id}|${item.title ?? ""}|${item.media_type ?? ""}|${item.creator ?? ""}|${item.release_date ?? ""}|${item.status ?? ""}`,
    )
    .join(";;");
  return createHash("sha256").update(joined).digest("hex");
}
