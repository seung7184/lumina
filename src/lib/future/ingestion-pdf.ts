import type { SourceDocument, SourceSegment } from "@/lib/types/workspace";

export interface PdfIngestionInput {
  fileName: string;
  fileBytes: ArrayBuffer;
  languageHint?: string;
}

export interface PdfIngestionResult {
  source: SourceDocument;
  segments: SourceSegment[];
  pageImages?: Array<{ pageNumber: number; imageUrl: string }>;
}

export async function ingestPdfSource(_input: PdfIngestionInput): Promise<PdfIngestionResult> {
  void _input;
  // TODO: Extract text blocks with page numbers and preserve layout/page-image
  // references for tables, diagrams, and figure-heavy PDFs.
  throw new Error("PDF ingestion is not implemented in this front-end slice.");
}
