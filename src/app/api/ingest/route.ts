import { YoutubeTranscript } from "youtube-transcript";
import * as cheerio from "cheerio";

interface IngestRequest {
  kind: "youtube" | "webpage" | "text";
  url?: string;
  text?: string;
  title?: string;
  language?: string;
}

interface ExtractedSegment {
  index: number;
  startSeconds: number;
  endSeconds?: number;
  text: string;
  language: string;
  speaker?: string;
}

interface IngestResponse {
  sourceId: string;
  kind: "youtube" | "webpage" | "text";
  title: string;
  url?: string;
  creator?: string;
  language: string;
  segments: ExtractedSegment[];
  totalDurationSeconds?: number;
}

function parseYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    }
    if (hostname === "youtube.com" || hostname === "www.youtube.com") {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      const shortOrEmbed = parsed.pathname.match(/^\/(shorts|embed)\/([A-Za-z0-9_-]+)/);
      if (shortOrEmbed) return shortOrEmbed[2];
    }
  } catch {
    // invalid url
  }
  return null;
}

async function ingestYouTube(url: string): Promise<IngestResponse> {
  const videoId = parseYouTubeVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL. Provide a valid YouTube video link.");
  }

  const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

  if (!transcriptItems.length) {
    throw new Error("No transcript available for this video. The video may not have captions enabled.");
  }

  const segments: ExtractedSegment[] = transcriptItems.map((item, index) => ({
    index,
    startSeconds: Math.floor(item.offset / 1000),
    endSeconds: Math.floor((item.offset + item.duration) / 1000),
    text: item.text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
    language: "auto",
  }));

  const lastSegment = segments[segments.length - 1];
  const totalDuration = lastSegment ? (lastSegment.endSeconds ?? lastSegment.startSeconds + 10) : 0;

  return {
    sourceId: `src-youtube-${videoId}`,
    kind: "youtube",
    title: `YouTube Video: ${videoId}`,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    language: "auto",
    segments,
    totalDurationSeconds: totalDuration,
  };
}

async function ingestWebpage(url: string): Promise<IngestResponse> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("Invalid URL. Provide a valid webpage link.");
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Lumina/1.0; +https://lumina.ai)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch webpage: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  $("script, style, nav, footer, header, aside, .sidebar, .menu, .advertisement, .ad, iframe, noscript").remove();

  const title = $("title").text().trim()
    || $("h1").first().text().trim()
    || $('meta[property="og:title"]').attr("content")?.trim()
    || parsedUrl.hostname;

  const articleBody = $("article").length > 0
    ? $("article")
    : $("main").length > 0
      ? $("main")
      : $("body");

  const paragraphs: string[] = [];
  articleBody.find("p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, td").each((_i, el) => {
    const text = $(el).text().trim();
    if (text.length > 20) {
      paragraphs.push(text);
    }
  });

  if (!paragraphs.length) {
    const bodyText = articleBody.text().trim();
    const chunks = bodyText.split(/\n\s*\n/).filter((chunk) => chunk.trim().length > 20);
    paragraphs.push(...chunks.slice(0, 100));
  }

  if (!paragraphs.length) {
    throw new Error("Could not extract meaningful content from this webpage.");
  }

  const segments: ExtractedSegment[] = paragraphs.map((text, index) => ({
    index,
    startSeconds: 0,
    text,
    language: "auto",
  }));

  return {
    sourceId: `src-web-${Buffer.from(url).toString("base64url").slice(0, 32)}`,
    kind: "webpage",
    title,
    url,
    language: "auto",
    segments,
  };
}

function ingestText(text: string, title?: string): IngestResponse {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (!paragraphs.length) {
    throw new Error("Provide some text content to analyze.");
  }

  const segments: ExtractedSegment[] = paragraphs.map((p, index) => ({
    index,
    startSeconds: 0,
    text: p,
    language: "auto",
  }));

  return {
    sourceId: `src-text-${Date.now()}`,
    kind: "text",
    title: title || paragraphs[0].slice(0, 60) + (paragraphs[0].length > 60 ? "..." : ""),
    language: "auto",
    segments,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IngestRequest;

    let result: IngestResponse;

    switch (body.kind) {
      case "youtube": {
        if (!body.url) {
          return Response.json({ error: "URL is required for YouTube ingestion." }, { status: 400 });
        }
        result = await ingestYouTube(body.url);
        break;
      }
      case "webpage": {
        if (!body.url) {
          return Response.json({ error: "URL is required for webpage ingestion." }, { status: 400 });
        }
        result = await ingestWebpage(body.url);
        break;
      }
      case "text": {
        if (!body.text) {
          return Response.json({ error: "Text content is required for text ingestion." }, { status: 400 });
        }
        result = ingestText(body.text, body.title);
        break;
      }
      default:
        return Response.json({ error: `Unsupported source kind: ${body.kind}` }, { status: 400 });
    }

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during ingestion.";
    return Response.json({ error: message }, { status: 500 });
  }
}
