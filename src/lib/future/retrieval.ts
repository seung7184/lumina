import type { CitationRef, GroundingStatus, SourceSegment } from "@/lib/types/workspace";

export interface RetrievalQuery {
  query: string;
  sourceIds: string[];
  language?: string;
  limit?: number;
}

export interface RetrievalMatch {
  segment: SourceSegment;
  score: number;
  status: GroundingStatus;
}

export interface CitationBuildInput {
  blockId: string;
  segmentIds: string[];
  status: GroundingStatus;
}

export async function retrieveSourceSegments(_query: RetrievalQuery): Promise<RetrievalMatch[]> {
  void _query;
  // TODO: Query embeddings plus metadata filters by source, timestamp, page,
  // speaker, language, and report mode.
  throw new Error("Retrieval is not implemented in this front-end slice.");
}

export function buildCitationRef(_input: CitationBuildInput): CitationRef {
  void _input;
  // TODO: Create citation refs at generation time, not after rendering.
  throw new Error("Citation building is not implemented in this front-end slice.");
}
