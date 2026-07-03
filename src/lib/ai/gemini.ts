import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (genAI) return genAI;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("GEMINI_API_KEY is not configured. Get a free key at https://aistudio.google.com/apikey");
  }
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

const DEFAULT_MODEL = "gemini-2.5-flash-lite";
const FALLBACK_MODEL = "gemini-2.5-flash";

export function getFallbackModelNames(preferredModel = process.env.GEMINI_MODEL || DEFAULT_MODEL): string[] {
  return Array.from(new Set([preferredModel, FALLBACK_MODEL]));
}

export function isRetryableAIError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes("503")
    || message.includes("service unavailable")
    || message.includes("high demand")
    || message.includes("429")
    || message.includes("too many requests")
    || message.includes("quota exceeded");
}

export function getGenerativeModel(modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL) {
  return getClient().getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
    },
  });
}

export function isAIConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY;
  return !!apiKey && apiKey !== "your_gemini_api_key_here";
}
