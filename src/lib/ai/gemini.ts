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

export function getGenerativeModel(modelName = "gemini-2.0-flash") {
  return getClient().getGenerativeModel({ model: modelName });
}

export function isAIConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY;
  return !!apiKey && apiKey !== "your_gemini_api_key_here";
}
