export type IngestionStatusPhase =
  | "idle"
  | "validating-url"
  | "selecting-provider"
  | "fetching-transcript"
  | "parsing-manual-transcript"
  | "normalizing-segments"
  | "ready"
  | "error";

export interface SourceIngestionStatus {
  phase: IngestionStatusPhase;
  label: string;
  message?: string;
  providerName?: string;
  providerReliability?: "demo" | "experimental" | "production";
  segmentCount?: number;
  citationCount?: number;
  warnings?: string[];
}

export const idleSourceIngestionStatus: SourceIngestionStatus = {
  phase: "idle",
  label: "Idle",
  message: "Local mock ingestion is ready.",
};
