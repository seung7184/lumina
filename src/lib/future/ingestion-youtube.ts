import type { SourceDocument, SourceSegment } from "@/lib/types/workspace";

export interface YouTubeIngestionInput {
  url: string;
  preferredLanguages: string[];
}

export interface YouTubeIngestionResult {
  source: SourceDocument;
  segments: SourceSegment[];
  transcriptSource: "captions" | "user_transcript" | "transcription";
}

export async function ingestYouTubeSource(_input: YouTubeIngestionInput): Promise<YouTubeIngestionResult> {
  void _input;
  // TODO: Resolve video metadata, use a reliable caption path where available,
  // and fall back to user-provided transcript or transcription.
  throw new Error("YouTube ingestion is not implemented in this front-end slice.");
}
