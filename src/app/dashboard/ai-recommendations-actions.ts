"use server";

import { createClient } from "@/lib/supabase/server";
import { listMediaItems } from "@/lib/media-items";
import { openai } from "@/lib/openai";
import type { MediaType } from "@/lib/db-types";
import { enrichRecommendation } from "@/lib/enrich-recommendations";
import type { EnrichedRecommendation } from "@/lib/enrich-recommendations";

const WHATS_ON_YOUR_MIND_MAX_LENGTH = 200;

export type Recommendation = {
  title: string;
  media_type: MediaType;
  why: string;
};

export type RecommendationsResult = {
  recommendations: Recommendation[];
  error?: string;
};

const DEMO_RECOMMENDATIONS: Recommendation[] = [
  {
    title: "Hades",
    media_type: "game",
    why: "Roguelike with strong narrative and character work, matches your completed titles.",
  },
  {
    title: "Severance",
    media_type: "series",
    why: "You enjoyed workplace dystopia and surreal drama.",
  },
  {
    title: "Disco Elysium",
    media_type: "game",
    why: "Narrative-rich RPG with strong writing, similar to your completed titles.",
  },
];

/** Static picks for "What's on your mind?" when AI_MODE is demo */
const WHATS_ON_YOUR_MIND_DEMO: Recommendation[] = [
  { title: "Spirited Away", media_type: "movie", why: "Perfect for when you want something thoughtful and beautiful to get lost in." },
  { title: "The Bear", media_type: "series", why: "Intense, short, and satisfying—great when you need something that hits." },
  { title: "Hades", media_type: "game", why: "Pick-up-and-play fun with a story that grows on you." },
  { title: "Random Access Memories", media_type: "music", why: "Smooth, uplifting listen for any mood." },
];

function buildSummary(items: { title: string; media_type: string; genre?: string | null; tags?: string[] | null }[]): string {
  return items
    .map((i) => {
      const genre = i.genre?.trim() || "";
      const tags = Array.isArray(i.tags) ? i.tags.join(", ") : "";
      return `- ${i.title} (${i.media_type})${genre ? ` genre: ${genre}` : ""}${tags ? ` tags: ${tags}` : ""}`;
    })
    .join("\n");
}

function buildExcludeTitles(items: { title: string }[]): string {
  if (items.length === 0) return "(none)";
  return items.map((i) => i.title.trim()).filter(Boolean).join(", ");
}

function ensureBalancedRecommendations(list: Recommendation[]): Recommendation[] {
  const result = [...list];

  if (result.filter((r) => r.media_type === "music").length < 1) {
    result.push({
      title: "Random Access Memories",
      media_type: "music",
      why: "Popular critically acclaimed album.",
    });
  }
  if (result.filter((r) => r.media_type === "game").length < 1) {
    result.push({
      title: "Elden Ring",
      media_type: "game",
      why: "Highly rated modern RPG.",
    });
  }
  while (
    result.filter(
      (r) => r.media_type === "movie" || r.media_type === "series",
    ).length < 2
  ) {
    result.push({
      title: "The Dark Knight",
      media_type: "movie",
      why: "Widely acclaimed film.",
    });
  }
  return result;
}

function parseRecommendationsJson(raw: string): Recommendation[] | null {
  try {
    const trimmed = raw.trim();
    const jsonStr = trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const parsed = JSON.parse(jsonStr) as unknown;
    if (!parsed || typeof parsed !== "object" || !("recommendations" in parsed))
      return null;
    const arr = (parsed as { recommendations: unknown }).recommendations;
    if (!Array.isArray(arr)) return null;
    const valid: Recommendation[] = [];
    const types: MediaType[] = ["movie", "series", "game", "music"];
    for (const item of arr) {
      if (
        item &&
        typeof item === "object" &&
        "title" in item &&
        "media_type" in item &&
        "why" in item &&
        typeof (item as Recommendation).title === "string" &&
        typeof (item as Recommendation).why === "string" &&
        types.includes((item as Recommendation).media_type)
      ) {
        valid.push({
          title: (item as Recommendation).title,
          media_type: (item as Recommendation).media_type,
          why: (item as Recommendation).why,
        });
      }
    }
    return valid;
  } catch {
    return null;
  }
}

export async function generateRecommendationsAction(): Promise<RecommendationsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { recommendations: [], error: "Not authenticated" };

  const completed = await listMediaItems(supabase, user.id, {
    status: "completed",
  });
  const allLibrary = await listMediaItems(supabase, user.id);
  const excludeTitles = buildExcludeTitles(allLibrary);

  const mode = process.env.AI_MODE ?? "demo";

  if (mode !== "live" || !openai) {
    return { recommendations: ensureBalancedRecommendations(DEMO_RECOMMENDATIONS) };
  }

  try {
    const summary =
        completed.length > 0
          ? buildSummary(completed)
          : "The user has no completed items yet.";
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.6,
        max_tokens: 600,
        messages: [
          {
            role: "system",
            content:
              "You are a media recommendation assistant. Return ONLY valid JSON. You MUST return balanced types: at least 2 items of type 'movie' or 'series', at least 1 of type 'music', and at least 1 of type 'game'. Allowed media_type values: 'movie' | 'series' | 'music' | 'game'. Do NOT return only movies. Never recommend a title that is already in the user's library; suggest similar titles (same genres, themes, or vibes) that they have not added.",
          },
          {
            role: "user",
            content: `Based on this user's completed media (titles, types, genres, tags), suggest 3–5 personalized recommendations that are SIMILAR in taste but DIFFERENT titles.

CRITICAL: Do NOT recommend any title that appears in "Titles already in library" below. Only suggest titles the user does NOT already have. Suggest similar genres, themes, or vibes—but different titles.

Titles already in library (do not recommend these):
${excludeTitles}

You MUST return:
- At least 2 recommendations of type 'movie' or 'series'
- At least 1 recommendation of type 'music'
- At least 1 recommendation of type 'game'

Allowed media_type values: 'movie' | 'series' | 'music' | 'game'

Return balanced types. Do NOT return only movies. If you fail to include music or game, the response is invalid.

Return strictly JSON in this format:
{ "recommendations": [ { "title": string, "media_type": "movie"|"series"|"game"|"music", "why": string } ] }
Each "why" must be one short sentence. No extra commentary.

User's completed items (use for taste; do not repeat these titles):
${summary}`,
          },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (typeof content !== "string")
        return { recommendations: [], error: "Invalid AI response" };

      const recommendations = parseRecommendationsJson(content);
      if (!recommendations)
        return { recommendations: [], error: "Invalid AI response" };
      const libraryTitles = new Set(
        allLibrary.map((i) => i.title?.trim().toLowerCase()).filter(Boolean),
      );
      const filtered = recommendations.filter(
        (r) => !libraryTitles.has(r.title.trim().toLowerCase()),
      );
      return { recommendations: ensureBalancedRecommendations(filtered) };
  } catch {
    return { recommendations: [], error: "AI request failed" };
  }
  return { recommendations: ensureBalancedRecommendations(DEMO_RECOMMENDATIONS) };
}

export type WhatsOnYourMindResult = {
  suggestions: EnrichedRecommendation[];
  error?: string;
};

/**
 * "What's on your mind?" — user sends a short mood/prompt, get back picks to watch/listen/play.
 * Prompt is limited to WHATS_ON_YOUR_MIND_MAX_LENGTH chars for AI usage.
 * Demo mode returns static picks; live mode uses OpenAI with a friendly prompt.
 */
export async function whatsOnYourMindRecommendationsAction(
  formData: FormData,
): Promise<WhatsOnYourMindResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { suggestions: [], error: "Please sign in to get picks." };

  const rawPrompt = (formData.get("prompt") as string)?.trim() ?? "";
  const prompt = rawPrompt.slice(0, WHATS_ON_YOUR_MIND_MAX_LENGTH);

  const allLibrary = await listMediaItems(supabase, user.id);
  const excludeTitles = buildExcludeTitles(allLibrary);
  const completed = await listMediaItems(supabase, user.id, { status: "completed" });
  const librarySummary =
    completed.length > 0 ? buildSummary(completed) : "They have no completed items yet.";
  const mode = process.env.AI_MODE ?? "demo";

  let raw: Recommendation[];

  if (mode !== "live" || !openai) {
    raw = ensureBalancedRecommendations(WHATS_ON_YOUR_MIND_DEMO);
  } else if (prompt.length > 0) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.65,
        max_tokens: 600,
        messages: [
          {
            role: "system",
            content:
              "You are a friendly media recommendation assistant. The user will tell you what's on their mind (mood, situation, or what they feel like). Suggest 3–5 things to watch, listen to, or play that fit the vibe. Return ONLY valid JSON. Use media_type: 'movie' | 'series' | 'music' | 'game'. Include at least one 'movie' or 'series', at least one 'music', and at least one 'game' when possible. Do NOT suggest titles they already have in their library. Each recommendation needs: title, media_type, and why (one short, friendly sentence).",
          },
          {
            role: "user",
            content: `What's on their mind: "${prompt}"

Titles they already have (do not suggest these): ${excludeTitles}

Their taste from completed items (use for style, don't repeat titles):
${librarySummary}

Return JSON only: { "recommendations": [ { "title": "...", "media_type": "movie"|"series"|"game"|"music", "why": "..." } ] }`,
          },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (typeof content !== "string")
        return { suggestions: [], error: "Something went wrong. Try again." };

      const parsed = parseRecommendationsJson(content);
      if (!parsed) return { suggestions: [], error: "Something went wrong. Try again." };

      const libraryTitles = new Set(
        allLibrary.map((i) => i.title?.trim().toLowerCase()).filter(Boolean),
      );
      const filtered = parsed.filter(
        (r) => !libraryTitles.has(r.title.trim().toLowerCase()),
      );
      raw = ensureBalancedRecommendations(filtered);
    } catch {
      return { suggestions: [], error: "We couldn't load picks right now. Try again in a moment." };
    }
  } else {
    return { suggestions: [], error: "Tell us what's on your mind in a few words." };
  }

  try {
    const suggestions: EnrichedRecommendation[] = await Promise.all(
      raw.map((r, i) => enrichRecommendation(r, i)),
    );
    return { suggestions };
  } catch {
    return { suggestions: [], error: "We couldn't load details. Try again." };
  }
}
