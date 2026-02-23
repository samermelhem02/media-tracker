"use server";

import { openai } from "@/lib/openai";

export type AIMetadata = {
  genre: string;
  description: string;
  creator: string;
  review: string;
  rating: number;
  tags: string[];
  error?: string;
};

const DEMO_RESPONSE: AIMetadata = {
  genre: "Sci-Fi",
  description:
    "A compelling story with strong character development and immersive world-building.",
  creator: "Unknown Director",
  review: "",
  rating: 8,
  tags: ["drama", "character-driven", "emotional"],
};

function parseMetadataJson(raw: string): AIMetadata | null {
  try {
    const trimmed = raw.trim();
    const jsonStr = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(jsonStr) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "genre" in parsed &&
      "rating" in parsed &&
      "tags" in parsed &&
      typeof (parsed as AIMetadata).genre === "string" &&
      typeof (parsed as AIMetadata).rating === "number" &&
      Array.isArray((parsed as AIMetadata).tags) &&
      (parsed as AIMetadata).tags.every((t) => typeof t === "string")
    ) {
      const p = parsed as Record<string, unknown>;
      const r = (p.rating as number) ?? 8;
      const rating = Number.isInteger(r) && r >= 1 && r <= 10 ? r : 8;
      const description = typeof p.description === "string" ? p.description : (typeof p.review === "string" ? p.review : "");
      const creator = typeof p.creator === "string" ? p.creator : "";
      return {
        genre: (parsed as AIMetadata).genre,
        description,
        creator,
        review: "",
        rating,
        tags: (parsed as AIMetadata).tags,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function generateMetadataAction(
  formData: FormData,
): Promise<AIMetadata> {
  const title = formData.get("title");
  const type = formData.get("type");

  if (title == null || String(title).trim() === "") {
    return {
      genre: "",
      description: "",
      creator: "",
      review: "",
      rating: 0,
      tags: [],
      error: "Title is required",
    };
  }

  const titleStr = String(title).trim();
  const typeStr = type != null ? String(type).trim() : "";

  const mode = process.env.AI_MODE;

  if (mode === "demo") {
    return { ...DEMO_RESPONSE };
  }

  if (mode === "live") {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content:
              "You are a media metadata generator. Return ONLY valid JSON.",
          },
          {
            role: "user",
            content: `Generate metadata for the given title and type.
Return strictly JSON in this format:
{
  "genre": string,
  "description": string (short plot/summary, under 120 words),
  "creator": string (director, artist, or studio name),
  "rating": number (1-10),
  "tags": string[]
}
The rating must be between 1 and 10.
No extra commentary.

Title: ${titleStr}
Type: ${typeStr || "unknown"}`,
          },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (typeof content !== "string") {
        return { ...DEMO_RESPONSE, error: "Invalid AI response" };
      }

      const parsed = parseMetadataJson(content);
      if (!parsed) {
        return { ...DEMO_RESPONSE, error: "Invalid AI response" };
      }
      return parsed;
    } catch {
      return { ...DEMO_RESPONSE, error: "AI request failed" };
    }
  }

  return { ...DEMO_RESPONSE };
}
