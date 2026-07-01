import type { LanguageCode, SourceSegment } from "@/lib/types/workspace";

export interface TranscriptionInput {
  fileUrl: string;
  sourceId: string;
  languageHint?: LanguageCode;
}

export interface TranscriptionResult {
  language: LanguageCode;
  segments: SourceSegment[];
  confidence?: number;
}

export async function transcribeMedia(_input: TranscriptionInput): Promise<TranscriptionResult> {
  void _input;
  // TODO: Submit audio/video to a speech-to-text provider, preserve timestamps,
  // optional speaker labels, and confidence metadata.
  throw new Error("Transcription is not implemented in this front-end slice.");
}
