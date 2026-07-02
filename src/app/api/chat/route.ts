import { getGenerativeModel, isAIConfigured } from "@/lib/ai/gemini";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  history: ChatMessage[];
  segments: { index: number; text: string; startSeconds?: number }[];
  sourceTitle: string;
  sourceUrl?: string;
  language: "en" | "ko" | "both";
}

function buildSourceContext(segments: ChatRequest["segments"]): string {
  return segments
    .map((seg) => {
      const timeLabel = seg.startSeconds !== undefined
        ? `[${Math.floor(seg.startSeconds / 60)}:${(seg.startSeconds % 60).toString().padStart(2, "0")}]`
        : `[${seg.index}]`;
      return `${timeLabel} Segment ${seg.index}: ${seg.text}`;
    })
    .join("\n\n");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;

    if (!body.message?.trim()) {
      return Response.json({ error: "Message is required." }, { status: 400 });
    }

    if (!body.segments?.length) {
      return Response.json({ error: "No source segments provided for grounding." }, { status: 400 });
    }

    if (!isAIConfigured()) {
      return Response.json({
        error: "AI is not configured. Set GEMINI_API_KEY in .env.local (free key: https://aistudio.google.com/apikey)",
      }, { status: 503 });
    }

    const sourceContext = buildSourceContext(body.segments);

    const languageNote = body.language === "ko"
      ? "Respond in Korean. Preserve important English technical terms in parentheses."
      : body.language === "both"
        ? "Respond in both English and Korean, separated by '---'."
        : "Respond in English.";

    const systemPrompt = `You are Lumina's source-grounded research assistant. You answer questions ONLY based on the provided source material.

Source: "${body.sourceTitle}"
${body.sourceUrl ? `URL: ${body.sourceUrl}` : ""}

--- SOURCE CONTENT ---
${sourceContext}
--- END SOURCE CONTENT ---

CRITICAL RULES:
1. Only answer from the provided source content. If the answer is not in the source, say "This is not covered in the current source."
2. Reference specific segment indices in [brackets] for every factual claim, e.g. "According to segment [3]..."
3. Be honest about limitations — if the source only partially covers a topic, say so.
4. For Korean responses, preserve English technical terms in parentheses.
5. Be concise but thorough. Don't repeat the question back.

${languageNote}`;

    const model = getGenerativeModel();

    const chatHistory = body.history.map((msg) => ({
      role: msg.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand. I will only answer from the provided source material and cite segment indices for every claim. How can I help you analyze this source?" }] },
        ...chatHistory,
      ],
    });

    const result = await chat.sendMessage(body.message);
    const text = result.response.text();

    return Response.json({
      response: text,
      language: body.language,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during chat.";
    return Response.json({ error: message }, { status: 500 });
  }
}
