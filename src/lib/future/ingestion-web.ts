import type { SourceDocument, SourceSegment } from "@/lib/types/workspace";

export interface WebIngestionInput {
  url: string;
  languageHint?: string;
}

export interface WebIngestionResult {
  source: SourceDocument;
  segments: SourceSegment[];
  canonicalUrl: string;
}

export async function ingestWebSource(_input: WebIngestionInput): Promise<WebIngestionResult> {
  void _input;
  // TODO: Fetch canonical metadata, extract readable content, preserve headings,
  // and normalize article blocks into source segments.
  throw new Error("Web ingestion is not implemented in this front-end slice.");
}
