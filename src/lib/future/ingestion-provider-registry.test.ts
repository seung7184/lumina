import { describe, expect, it } from "vitest";
import {
  getActiveSourceProviderForKind,
  getSourceProviderById,
  getSourceProviderRequirementsSummary,
  listActiveSourceProviders,
  listSourceProviders,
  listSourceProvidersByKind,
  selectSourceProviderForKind,
} from "@/lib/future/ingestion-provider-registry";

describe("source provider registry", () => {
  it("lists active local providers and future placeholders", () => {
    const providers = listSourceProviders();

    expect(providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "mock-youtube-transcript",
          sourceKind: "youtube",
          name: "Mock YouTube Transcript",
          shortLabel: "YouTube mock",
          availability: "active",
          reliability: "demo",
          capabilities: expect.arrayContaining(["mock", "translation"]),
          requiresNetwork: false,
          requiresApiKey: false,
          requiresUpload: false,
          requiresFileParsing: false,
          requiresOcr: false,
          usesAi: false,
          isDeterministic: true,
          isUserProvided: false,
        }),
        expect.objectContaining({
          id: "manual-transcript",
          sourceKind: "manual-transcript",
          name: "Manual Transcript",
          shortLabel: "Manual",
          availability: "active",
          reliability: "experimental",
          capabilities: ["manual-input"],
          isDeterministic: true,
          isUserProvided: true,
        }),
        expect.objectContaining({
          id: "mock-webpage",
          sourceKind: "webpage",
          name: "Mock Webpage",
          availability: "active",
          requiresNetwork: false,
          isDeterministic: true,
        }),
        expect.objectContaining({
          id: "mock-pdf",
          sourceKind: "pdf",
          name: "Mock PDF",
          availability: "active",
          requiresFileParsing: false,
          isDeterministic: true,
        }),
        expect.objectContaining({
          id: "future-pdf-ocr",
          sourceKind: "pdf",
          availability: "placeholder",
          capabilities: ["ocr"],
          requiresUpload: true,
          requiresFileParsing: true,
          requiresOcr: true,
          usesAi: false,
          isDeterministic: false,
        }),
      ]),
    );
  });

  it("keeps placeholders out of active provider lists", () => {
    const activeProviders = listActiveSourceProviders();

    expect(activeProviders.map((provider) => provider.id)).toEqual([
      "mock-youtube-transcript",
      "manual-transcript",
      "mock-webpage",
      "mock-pdf",
    ]);
    expect(activeProviders).not.toContainEqual(expect.objectContaining({ id: "future-webpage-extractor" }));
  });

  it("returns copied descriptors and copied capability arrays", () => {
    const [firstProvider] = listSourceProviders();
    firstProvider.name = "Mutated Provider";
    firstProvider.capabilities.push("ocr");

    expect(getSourceProviderById("mock-youtube-transcript")).toMatchObject({
      name: "Mock YouTube Transcript",
      capabilities: ["mock", "translation"],
    });
  });

  it("looks up providers by id and kind", () => {
    expect(getSourceProviderById("mock-webpage")).toMatchObject({
      id: "mock-webpage",
      sourceKind: "webpage",
    });
    expect(getSourceProviderById("missing-provider")).toBeUndefined();
    expect(listSourceProvidersByKind("pdf").map((provider) => provider.id)).toEqual([
      "mock-pdf",
      "future-pdf-text-extractor",
      "future-pdf-ocr",
    ]);
  });

  it("selects default active providers for every current source kind", () => {
    expect(getActiveSourceProviderForKind("youtube")?.id).toBe("mock-youtube-transcript");
    expect(getActiveSourceProviderForKind("manual-transcript")?.id).toBe("manual-transcript");
    expect(getActiveSourceProviderForKind("webpage")?.id).toBe("mock-webpage");
    expect(getActiveSourceProviderForKind("pdf")?.id).toBe("mock-pdf");

    expect(selectSourceProviderForKind("youtube")).toEqual({
      sourceKind: "youtube",
      providerId: "mock-youtube-transcript",
      reason: "Defaulting to the deterministic local mock provider until approved extraction providers are configured.",
      fallbackProviderIds: ["manual-transcript", "future-audio-transcription"],
    });
    expect(selectSourceProviderForKind("manual-transcript")).toEqual({
      sourceKind: "manual-transcript",
      providerId: "manual-transcript",
      reason: "Using user-provided manual transcript input.",
      fallbackProviderIds: [],
    });
  });

  it("summarizes provider requirements in readable labels", () => {
    expect(getSourceProviderRequirementsSummary(getSourceProviderById("manual-transcript") ?? never())).toEqual([
      "No network",
      "No API key",
      "Deterministic",
      "User-provided",
    ]);
    expect(getSourceProviderRequirementsSummary(getSourceProviderById("future-pdf-ocr") ?? never())).toEqual([
      "No network",
      "No API key",
      "Requires upload",
      "Requires file parsing",
      "Requires OCR",
      "Placeholder",
    ]);
  });
});

function never(): never {
  throw new Error("Expected provider descriptor to exist");
}
