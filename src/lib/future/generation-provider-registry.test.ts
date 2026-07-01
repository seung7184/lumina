import { describe, expect, it } from "vitest";
import {
  getActiveGenerationProvider,
  getGenerationProviderById,
  getGenerationProviderRequirementsSummary,
  listActiveGenerationProviders,
  listGenerationProviders,
  listGenerationProvidersByKind,
  selectGenerationProvider,
} from "@/lib/future/generation-provider-registry";

describe("generation provider registry", () => {
  it("registers the local deterministic brief provider as the only active provider", () => {
    const activeProviders = listActiveGenerationProviders();

    expect(activeProviders.map((provider) => provider.id)).toEqual(["local-deterministic-brief"]);
    expect(activeProviders[0]).toMatchObject({
      id: "local-deterministic-brief",
      kind: "local-deterministic",
      name: "Local Deterministic Brief",
      shortLabel: "Local brief",
      availability: "active",
      reliability: "demo",
      requiresNetwork: false,
      requiresApiKey: false,
      requiresModel: false,
      usesAi: false,
      usesEmbeddings: false,
      usesVectorSearch: false,
      storesUserData: false,
      isDeterministic: true,
      requiresCitations: true,
      preservesCitationIds: true,
      allowsUncitedClaims: false,
      outputModes: ["brief", "evidence"],
    });
    expect(activeProviders[0].capabilities).toEqual([
      "extractive-brief",
      "evidence-cards",
      "brief-blocks",
      "citation-preservation",
      "citation-required",
    ]);
  });

  it("keeps future AI-backed providers unavailable", () => {
    const futureProviderIds = [
      "future-openai-structured-brief",
      "future-anthropic-structured-brief",
      "future-gemini-structured-brief",
    ];
    const providers = futureProviderIds.map((providerId) => getGenerationProviderById(providerId));

    expect(providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "future-openai-structured-brief", availability: "placeholder", usesAi: true }),
        expect.objectContaining({ id: "future-anthropic-structured-brief", availability: "placeholder", usesAi: true }),
        expect.objectContaining({ id: "future-gemini-structured-brief", availability: "placeholder", usesAi: true }),
      ]),
    );
    expect(listActiveGenerationProviders().map((provider) => provider.id)).not.toEqual(expect.arrayContaining(futureProviderIds));
  });

  it("marks every future provider as placeholder or disabled with explicit citation safeguards", () => {
    const futureProviders = listGenerationProviders().filter((provider) => provider.id.startsWith("future-"));

    expect(futureProviders.map((provider) => provider.id)).toEqual([
      "future-openai-structured-brief",
      "future-anthropic-structured-brief",
      "future-gemini-structured-brief",
      "future-local-model-brief",
      "future-claim-validation",
      "future-citation-auditor",
    ]);
    futureProviders.forEach((provider) => {
      expect(["placeholder", "disabled"]).toContain(provider.availability);
      expect(provider.requiresCitations).toBe(true);
      expect(provider.preservesCitationIds).toBe(true);
      expect(provider.allowsUncitedClaims).toBe(false);
    });
  });

  it("lists providers by kind and finds providers by id", () => {
    expect(listGenerationProvidersByKind("local-deterministic").map((provider) => provider.id)).toEqual([
      "local-deterministic-brief",
    ]);
    expect(listGenerationProvidersByKind("ai-structured").map((provider) => provider.id)).toEqual([
      "future-openai-structured-brief",
      "future-anthropic-structured-brief",
      "future-gemini-structured-brief",
      "future-local-model-brief",
    ]);
    expect(getGenerationProviderById("missing-provider")).toBeUndefined();
    expect(getActiveGenerationProvider().id).toBe("local-deterministic-brief");
  });

  it("returns copied descriptors instead of mutable catalog entries", () => {
    const [firstProvider] = listGenerationProviders();
    firstProvider.name = "Mutated provider";
    firstProvider.capabilities.push("question-answering");

    const provider = getGenerationProviderById("local-deterministic-brief");

    expect(provider?.name).toBe("Local Deterministic Brief");
    expect(provider?.capabilities).not.toContain("question-answering");
  });

  it("summarizes provider requirements and availability", () => {
    const activeProvider = getActiveGenerationProvider();
    const futureProvider = getGenerationProviderById("future-openai-structured-brief");

    expect(getGenerationProviderRequirementsSummary(activeProvider)).toEqual(
      expect.arrayContaining([
        "No network",
        "No API key",
        "No AI model",
        "Preserves citations",
        "Citations required",
        "Deterministic",
        "No vector search",
      ]),
    );
    expect(futureProvider ? getGenerationProviderRequirementsSummary(futureProvider) : []).toEqual(
      expect.arrayContaining(["Requires network", "Requires API key", "Uses AI", "Requires model", "Placeholder"]),
    );
  });

  it("selects only the local deterministic provider by default", () => {
    expect(selectGenerationProvider()).toEqual({
      providerId: "local-deterministic-brief",
      reason: "Using the local deterministic provider until AI-backed generation providers are explicitly enabled.",
      fallbackProviderIds: [],
    });
  });
});
