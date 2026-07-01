import type {
  IngestionResult,
  NormalizedSourceSegment,
  PdfSourceInput,
  SegmentCitationRef,
  SourceMetadata,
} from "@/lib/types/workspace";
import { getSourceProviderById } from "@/lib/future/ingestion-provider-registry";

const mockPdfProviderDescriptor = getRequiredMockPdfProviderDescriptor();

export interface PdfIngestionProvider {
  id?: string;
  name: string;
  ingest(input: PdfSourceInput): Promise<IngestionResult> | IngestionResult;
}

export function ingestMockPdfSource(input: PdfSourceInput): IngestionResult {
  const canonicalUrl = input.url?.trim() || input.filename?.trim() || "mock-source.pdf";
  const title = input.title?.trim() || input.filename?.trim() || "Mock PDF source";
  const sourceMetadata: SourceMetadata = {
    sourceId: `src-pdf-${buildStableSourceSlug(canonicalUrl)}`,
    kind: "pdf",
    title,
    language: input.language ?? "en",
    canonicalUrl,
    providerId: mockPdfProviderDescriptor.id,
    providerName: mockPdfProviderDescriptor.name,
    providerReliability: mockPdfProviderDescriptor.reliability,
  };
  const segments = buildMockPdfSegments(sourceMetadata);

  return {
    sourceMetadata,
    segments,
    citations: createCitationRefsFromMockSegments(segments),
    warnings: [
      {
        code: "MOCK_PDF_BOUNDARY",
        message: "Mock PDF boundary only; no PDF bytes were parsed.",
        severity: "info",
      },
    ],
  };
}

export class MockPdfIngestionProvider implements PdfIngestionProvider {
  id = mockPdfProviderDescriptor.id;
  name = mockPdfProviderDescriptor.name;

  ingest(input: PdfSourceInput): IngestionResult {
    return ingestMockPdfSource(input);
  }
}

function buildMockPdfSegments(sourceMetadata: SourceMetadata): NormalizedSourceSegment[] {
  const segmentTexts = [
    "This mock PDF boundary represents a future uploaded or linked document source.",
    "The current pass does not parse PDF bytes, extract tables, or run OCR.",
    "Future PDF extraction should preserve page numbers and citation anchors.",
  ];

  return segmentTexts.map((text, index) => {
    const page = index + 1;

    return {
      id: `seg-${sourceMetadata.sourceId}-${String(index).padStart(3, "0")}`,
      sourceId: sourceMetadata.sourceId,
      index,
      startSeconds: index,
      displayTime: `Page ${page}`,
      text,
      language: sourceMetadata.language ?? "en",
      citationId: `cite-${sourceMetadata.sourceId}-${String(page).padStart(3, "0")}`,
      sourceUrl: `${sourceMetadata.canonicalUrl}#page=${page}`,
      metadata: {
        mockBoundary: true,
        page,
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
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return slug || "mock-source-pdf";
}

function getRequiredMockPdfProviderDescriptor() {
  const descriptor = getSourceProviderById("mock-pdf");

  if (!descriptor) {
    throw new Error("Mock PDF provider metadata is not configured.");
  }

  return descriptor;
}
