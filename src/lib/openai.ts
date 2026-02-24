import "server-only";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
/** Only set when OPENAI_API_KEY is provided; null otherwise so the app runs without it. */
export const openai: OpenAI | null = apiKey ? new OpenAI({ apiKey }) : null;
