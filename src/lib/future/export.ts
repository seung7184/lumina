import type { ExportOptions, SummaryDocument } from "@/lib/types/workspace";

export interface ExportInput {
  document: SummaryDocument;
  options: ExportOptions;
}

export interface ExportResult {
  fileName: string;
  mimeType: string;
  url?: string;
  text?: string;
}

export async function exportResearchDocument(_input: ExportInput): Promise<ExportResult> {
  void _input;
  // TODO: Serialize typed document blocks to Markdown, PDF, Slides, Notion, or
  // copy-link payloads while preserving citations and selected content options.
  throw new Error("Export is not implemented in this front-end slice.");
}
