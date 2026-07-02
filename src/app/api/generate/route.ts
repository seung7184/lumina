import { getGenerativeModel, isAIConfigured } from "@/lib/ai/gemini";

type TemplateId = "executive-brief" | "study-notes" | "decision-memo" | "action-checklist" | "email-draft" | "source-faq";
type OutputLanguage = "en" | "ko" | "both";

interface GenerateRequest {
  segments: { index: number; text: string; startSeconds?: number }[];
  sourceTitle: string;
  sourceUrl?: string;
  sourceKind: "youtube" | "webpage" | "text";
  template: TemplateId;
  language: OutputLanguage;
}

const templatePrompts: Record<TemplateId, string> = {
  "executive-brief": `Create an Executive Brief from the source material.

Structure:
1. **Overview** (2-3 sentences capturing the essence)
2. **Key Claims** (numbered list, each with [citation_index] referencing the source segment index)
3. **Evidence & Nuances** (important details, counterpoints, or caveats from the source)
4. **Source Confidence** (rate how well-supported each major claim is: "Strongly supported", "Partially supported", or "Needs verification")
5. **Implications** (what this means for the reader)

Every claim must reference the source segment index in [brackets]. If something is not in the source, explicitly say "Not found in source."`,

  "study-notes": `Create Study Notes from the source material.

Structure:
1. **Core Concepts** (main ideas explained clearly, each with [citation_index])
2. **Key Terms** (important vocabulary/concepts with definitions from the source)
3. **Recall Prompts** (Q&A pairs for self-testing, 5-8 questions)
4. **Summary Chain** (connect the main ideas in logical sequence)
5. **What to Review Further** (gaps or areas needing deeper study)

Keep English technical terms even when outputting in Korean. Every point must cite the source segment.`,

  "decision-memo": `Create a Decision Memo from the source material.

Structure:
1. **Decision Context** (what decision does this source inform?)
2. **Key Arguments For** (with [citation_index])
3. **Key Arguments Against / Risks** (with [citation_index])
4. **Evidence Quality** (how strong is the evidence for each position?)
5. **Recommended Action** (based solely on what the source supports)
6. **Information Gaps** (what's missing from this source to make a full decision?)

Be explicit about what the source says vs. what it doesn't cover.`,

  "action-checklist": `Create an Action Checklist from the source material.

Structure:
1. **Immediate Actions** (things to do right away, each with [citation_index])
2. **Short-term Tasks** (within the next week/month)
3. **Long-term Considerations** (strategic items to plan for)
4. **Dependencies** (what needs to happen first)
5. **Resources Needed** (tools, people, information required)

Each action item must be concrete and specific, traced to the source.`,

  "email-draft": `Create a professional Email/LinkedIn Draft based on the source material.

Structure:
1. **Subject Line** (clear, action-oriented)
2. **Opening** (context-setting, 1-2 sentences)
3. **Key Points** (3-5 bullet points from the source, with [citation_index])
4. **Call to Action** (what you want the reader to do)
5. **Closing**

Tone: Professional but approachable. Reference specific data/claims from the source.`,

  "source-faq": `Create a Source-Grounded FAQ from the source material.

Generate 6-10 Q&A pairs that a reader would likely ask about this content.

Format each as:
**Q: [Question]**
A: [Answer with [citation_index] references]

Focus on:
- What the source actually says (not assumptions)
- Common misconceptions the source addresses
- Practical applications of the content
- Limitations or caveats mentioned in the source`,
};

function buildSourceContext(segments: GenerateRequest["segments"]): string {
  return segments
    .map((seg) => {
      const timeLabel = seg.startSeconds !== undefined ? `[${formatTime(seg.startSeconds)}]` : `[${seg.index}]`;
      return `${timeLabel} Segment ${seg.index}: ${seg.text}`;
    })
    .join("\n\n");
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function buildLanguageInstruction(language: OutputLanguage): string {
  switch (language) {
    case "ko":
      return "Output entirely in Korean. Preserve important English technical terms in parentheses when they have no common Korean equivalent.";
    case "both":
      return "Output in both English and Korean. Provide the English version first, then a Korean version under a '---' separator. Preserve technical terms in both versions.";
    default:
      return "Output in English.";
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequest;

    if (!body.segments?.length) {
      return Response.json({ error: "No source segments provided." }, { status: 400 });
    }

    if (!isAIConfigured()) {
      return Response.json({
        error: "AI is not configured. Set GEMINI_API_KEY in .env.local (free key: https://aistudio.google.com/apikey)",
      }, { status: 503 });
    }

    const templatePrompt = templatePrompts[body.template];
    if (!templatePrompt) {
      return Response.json({ error: `Unknown template: ${body.template}` }, { status: 400 });
    }

    const sourceContext = buildSourceContext(body.segments);
    const languageInstruction = buildLanguageInstruction(body.language);

    const prompt = `You are Lumina, a source-grounded AI research assistant. You ONLY make claims that are directly supported by the provided source material. If something is not in the source, you say "Not found in source."

Source: "${body.sourceTitle}"
${body.sourceUrl ? `URL: ${body.sourceUrl}` : ""}
Type: ${body.sourceKind}

--- SOURCE CONTENT ---
${sourceContext}
--- END SOURCE CONTENT ---

${languageInstruction}

${templatePrompt}

CRITICAL RULES:
- Every factual claim must reference the source segment index in [brackets], e.g. [0], [3], [12]
- Never fabricate information not present in the source
- If the source is insufficient for a section, state that explicitly
- Maintain original nuances — do not oversimplify
- For Korean output, preserve English technical terms where appropriate`;

    const model = getGenerativeModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return Response.json({
      content: text,
      template: body.template,
      language: body.language,
      segmentCount: body.segments.length,
      sourceTitle: body.sourceTitle,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during generation.";
    return Response.json({ error: message }, { status: 500 });
  }
}
