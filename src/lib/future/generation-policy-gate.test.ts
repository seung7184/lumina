import { describe, expect, it } from "vitest";
import { evaluateGenerationPolicy } from "@/lib/future/generation-policy-gate";
import type { GenerationProviderDescriptor } from "@/lib/future/generation-provider-registry";
import type { CitationAuditResult, DeterministicBrief } from "@/lib/types/workspace";

function provider(overrides: Partial<GenerationProviderDescriptor> = {}): GenerationProviderDescriptor {
  return {
    id: "local-deterministic-brief",
    kind: "local-deterministic",
    name: "Local Deterministic Brief",
    shortLabel: "Local brief",
    description: "Local deterministic test provider.",
    availability: "active",
    reliability: "demo",
    capabilities: ["extractive-brief", "evidence-cards", "brief-blocks", "citation-preservation", "citation-required"],
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
    ...overrides,
  };
}

function citationAudit(overrides: Partial<CitationAuditResult> = {}): CitationAuditResult {
  return {
    id: "audit-brief-policy",
    briefId: "brief-policy",
    passed: true,
    issueCount: 1,
    errorCount: 0,
    warningCount: 0,
    checkedCitationIds: ["cite-1"],
    checkedSegmentIds: ["seg-1"],
    issues: [
      {
        id: "audit-brief-policy-issue-1",
        code: "AUDIT_PASSED",
        severity: "info",
        message: "Citation audit passed.",
        targetType: "brief",
        targetId: "brief-policy",
      },
    ],
    ...overrides,
  };
}

function brief(overrides: Partial<DeterministicBrief> = {}): DeterministicBrief {
  return {
    id: "brief-policy",
    sourceId: "src-policy",
    title: "Local source-grounded brief",
    subtitle: "Generated from current source segments · no AI model used",
    generatedBy: "local-deterministic",
    providerId: "local-deterministic-brief",
    providerName: "Local Deterministic Brief",
    providerReliability: "demo",
    evidenceCards: [
      {
        id: "evidence-policy",
        sourceId: "src-policy",
        segmentIds: ["seg-1"],
        citationIds: ["cite-1"],
        label: "1",
        title: "Evidence 1",
        body: "Source-backed evidence.",
        kind: "claim",
      },
    ],
    blocks: [
      {
        id: "brief-policy-overview",
        title: "Overview",
        body: "Source-backed overview.",
        citationIds: ["cite-1"],
        evidenceCardIds: ["evidence-policy"],
        kind: "overview",
      },
    ],
    citationIds: ["cite-1"],
    warnings: [],
    citationAudit: citationAudit(),
    ...overrides,
  };
}

describe("evaluateGenerationPolicy", () => {
  it("allows a valid local deterministic brief as source-grounded output", () => {
    const result = evaluateGenerationPolicy({ brief: brief(), provider: provider() });

    expect(result).toMatchObject({
      id: "policy-brief-policy",
      briefId: "brief-policy",
      providerId: "local-deterministic-brief",
      allowedToDisplay: true,
      allowedToUseAsSourceGrounded: true,
      errorCount: 0,
      warningCount: 0,
      issueCount: 1,
    });
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: "POLICY_PASSED",
        severity: "info",
        targetType: "brief",
        targetId: "brief-policy",
      }),
    ]);
  });

  it("blocks missing, inactive, AI-backed, and citation-unsafe providers", () => {
    const missingProviderResult = evaluateGenerationPolicy({ brief: brief() });
    expect(missingProviderResult.allowedToDisplay).toBe(false);
    expect(missingProviderResult.allowedToUseAsSourceGrounded).toBe(false);
    expect(missingProviderResult.issues).toEqual([
      expect.objectContaining({
        code: "PROVIDER_NOT_FOUND",
        severity: "error",
        targetType: "provider",
        targetId: "local-deterministic-brief",
      }),
    ]);

    const unsafeProviderResult = evaluateGenerationPolicy({
      brief: brief(),
      provider: provider({
        availability: "placeholder",
        usesAi: true,
        requiresCitations: false,
        preservesCitationIds: false,
        allowsUncitedClaims: true,
      }),
    });

    expect(unsafeProviderResult.allowedToDisplay).toBe(false);
    expect(unsafeProviderResult.issues.map((issue) => issue.code)).toEqual([
      "PROVIDER_NOT_ACTIVE",
      "PROVIDER_USES_AI",
      "PROVIDER_DOES_NOT_REQUIRE_CITATIONS",
      "PROVIDER_DOES_NOT_PRESERVE_CITATIONS",
      "PROVIDER_ALLOWS_UNCITED_CLAIMS",
    ]);
  });

  it("blocks missing or failed citation audits", () => {
    const missingAuditResult = evaluateGenerationPolicy({
      brief: brief({ citationAudit: undefined }),
      provider: provider(),
    });

    expect(missingAuditResult.allowedToDisplay).toBe(false);
    expect(missingAuditResult.issues).toEqual([
      expect.objectContaining({
        code: "MISSING_CITATION_AUDIT",
        severity: "error",
        targetType: "citation-audit",
      }),
    ]);

    const failedAuditResult = evaluateGenerationPolicy({
      brief: brief({
        citationAudit: citationAudit({
          passed: false,
          errorCount: 2,
        }),
      }),
      provider: provider(),
    });

    expect(failedAuditResult.allowedToDisplay).toBe(false);
    expect(failedAuditResult.issues.map((issue) => issue.code)).toEqual(["CITATION_AUDIT_FAILED", "CITATION_AUDIT_ERRORS"]);
  });

  it("allows display with a warning for empty generated output", () => {
    const result = evaluateGenerationPolicy({
      brief: brief({
        evidenceCards: [],
        blocks: [],
        citationIds: [],
        citationAudit: citationAudit({
          warningCount: 1,
        }),
      }),
      provider: provider(),
    });

    expect(result.allowedToDisplay).toBe(true);
    expect(result.allowedToUseAsSourceGrounded).toBe(true);
    expect(result.errorCount).toBe(0);
    expect(result.warningCount).toBe(1);
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: "EMPTY_GENERATED_OUTPUT",
        severity: "warning",
        targetType: "brief",
        targetId: "brief-policy",
      }),
    ]);
  });
});
