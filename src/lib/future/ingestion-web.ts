import type {
  IngestionError,
  IngestionResult,
  NormalizedSourceSegment,
  SegmentCitationRef,
  SourceMetadata,
  WebpageSourceInput,
} from "@/lib/types/workspace";
import { getSourceProviderById } from "@/lib/future/ingestion-provider-registry";

const mockWebpageProviderDescriptor = getRequiredMockWebpageProviderDescriptor();

export interface WebpageIngestionProvider {
  id?: string;
  name: string;
  ingest(input: WebpageSourceInput): Promise<IngestionResult> | IngestionResult;
}

export class WebpageIngestionException extends Error implements IngestionError {
  code: IngestionError["code"];
  recoverable: boolean;

  constructor(code: IngestionError["code"], message: string, recoverable = true) {
    super(message);
    this.name = "WebpageIngestionException";
    this.code = code;
    this.recoverable = recoverable;
  }
}

export function isWebpageIngestionError(error: unknown): error is IngestionError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    "recoverable" in error
  );
}

export function parseWebpageSourceUrl(url: string): URL {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    throw new WebpageIngestionException("INVALID_URL", "Enter a valid webpage URL.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new WebpageIngestionException("INVALID_URL", "Enter a valid webpage URL.");
  }

  return parsedUrl;
}

export function ingestMockWebpageSource(input: WebpageSourceInput): IngestionResult {
  const parsedUrl = parseWebpageSourceUrl(input.url);
  const canonicalUrl = parsedUrl.toString();
  const sourceId = `src-webpage-${buildStableSourceSlug(`${parsedUrl.hostname}${parsedUrl.pathname}`)}`;
  const title = input.title?.trim() || parsedUrl.hostname.replace(/^www\./, "");
  const sourceMetadata: SourceMetadata = {
    sourceId,
    kind: "webpage",
    title,
    language: input.language ?? "en",
    canonicalUrl,
    providerId: mockWebpageProviderDescriptor.id,
    providerName: mockWebpageProviderDescriptor.name,
    providerReliability: mockWebpageProviderDescriptor.reliability,
  };
  const segments = buildMockWebpageSegments(sourceMetadata);

  return {
    sourceMetadata,
    segments,
    citations: createCitationRefsFromMockSegments(segments),
    warnings: [],
  };
}

export class MockWebpageIngestionProvider implements WebpageIngestionProvider {
  id = mockWebpageProviderDescriptor.id;
  name = mockWebpageProviderDescriptor.name;

  ingest(input: WebpageSourceInput): IngestionResult {
    return ingestMockWebpageSource(input);
  }
}

function buildMockWebpageSegments(sourceMetadata: SourceMetadata): NormalizedSourceSegment[] {
  const segmentTexts = [
    "This mock webpage boundary represents a future article source without fetching the live page.",
    "Lumina keeps source attribution separate from AI generation so ingestion can be tested safely first.",
    "Real webpage extraction will be added behind an approved provider in a later pass.",
  ];

  return segmentTexts.map((text, index) => {
    const section = index + 1;

    return {
      id: `seg-${sourceMetadata.sourceId}-${String(index).padStart(3, "0")}`,
      sourceId: sourceMetadata.sourceId,
      index,
      startSeconds: index,
      displayTime: `Section ${section}`,
      text,
      language: sourceMetadata.language ?? "en",
      citationId: `cite-${sourceMetadata.sourceId}-${String(section).padStart(3, "0")}`,
      sourceUrl: `${sourceMetadata.canonicalUrl}#section-${section}`,
      metadata: {
        mockBoundary: true,
        section,
      },
    };
  });
}

function createCitationRefsFromMockSegments(segments: NormalizedSourceSegment[]): SegmentCitationRef[] {
  return segments.map((segment, index) => ({
    id: segment.citationId,
    sourceId: segment.sourceId,
    segmentId: segment.id,
    label: `[${index + 1}]`,
    displayTime: segment.displayTime,
    url: segment.sourceUrl,
  }));
}

function buildStableSourceSlug(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return slug || "webpage";
}

function getRequiredMockWebpageProviderDescriptor() {
  const descriptor = getSourceProviderById("mock-webpage");

  if (!descriptor) {
    throw new WebpageIngestionException("PROVIDER_UNAVAILABLE", "Mock webpage provider metadata is not configured.");
  }

  return descriptor;
}
