import { getPosterUrl } from "@/lib/tmdb";
import { getDefaultImage } from "@/lib/getDefaultImage";

export const DEFAULT_POSTER_URL = "/images/poster-placeholder.svg";

export function resolvePosterUrl(input?: string | null, type?: string): string {
  if (input && input.trim() !== "") {
    if (input.startsWith("http")) return input;
    return getPosterUrl(input) ?? (type ? getDefaultImage(type) : DEFAULT_POSTER_URL);
  }
  return type ? getDefaultImage(type) : DEFAULT_POSTER_URL;
}
