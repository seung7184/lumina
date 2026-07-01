import type { GenerationProviderDescriptor } from "@/lib/future/generation-provider-registry";
import type {
  DeterministicBrief,
  GenerationPolicyIssue,
  GenerationPolicyIssueCode,
  GenerationPolicyResult,
  GenerationPolicySeverity,
} from "@/lib/types/workspace";

export interface EvaluateGenerationPolicyInput {
  brief: DeterministicBrief;
  provider?: GenerationProviderDescriptor;
}

interface IssueInput {
  code: GenerationPolicyIssueCode;
  severity: GenerationPolicySeverity;
  message: string;
  targetType: GenerationPolicyIssue["targetType"];
  targetId?: string;
}

export function evaluateGenerationPolicy(input: EvaluateGenerationPolicyInput): GenerationPolicyResult {
  const policyId = `policy-${input.brief.id}`;
  const issues: GenerationPolicyIssue[] = [];

  function addIssue(issue: IssueInput) {
    issues.push({
      id: `${policyId}-issue-${issues.length + 1}`,
      ...issue,
    });
  }

  if (!input.provider) {
    addIssue({
      code: "PROVIDER_NOT_FOUND",
      severity: "error",
      message: "Generation provider was not found.",
      targetType: "provider",
      targetId: input.brief.providerId,
    });
  } else {
    evaluateProvider(input.provider, addIssue);
  }

  if (!input.brief.citationAudit) {
    addIssue({
      code: "MISSING_CITATION_AUDIT",
      severity: "error",
      message: "Generated brief is missing a citation audit.",
      targetType: "citation-audit",
      targetId: input.brief.id,
    });
  } else {
    if (!input.brief.citationAudit.passed) {
      addIssue({
        code: "CITATION_AUDIT_FAILED",
        severity: "error",
        message: "Citation audit did not pass.",
        targetType: "citation-audit",
        targetId: input.brief.citationAudit.id,
      });
    }

    if (input.brief.citationAudit.errorCount > 0) {
      addIssue({
        code: "CITATION_AUDIT_ERRORS",
        severity: "error",
        message: "Citation audit reported errors.",
        targetType: "citation-audit",
        targetId: input.brief.citationAudit.id,
      });
    }
  }

  if (input.brief.evidenceCards.length === 0 && input.brief.blocks.length === 0) {
    addIssue({
      code: "EMPTY_GENERATED_OUTPUT",
      severity: "warning",
      message: "Generated brief has no evidence cards or brief blocks.",
      targetType: "brief",
      targetId: input.brief.id,
    });
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  if (errorCount === 0 && warningCount === 0) {
    addIssue({
      code: "POLICY_PASSED",
      severity: "info",
      message: "Generation policy passed.",
      targetType: "brief",
      targetId: input.brief.id,
    });
  }

  const allowed = errorCount === 0;

  return {
    id: policyId,
    briefId: input.brief.id,
    providerId: input.provider?.id ?? input.brief.providerId,
    allowedToDisplay: allowed,
    allowedToUseAsSourceGrounded: allowed,
    issueCount: issues.length,
    errorCount,
    warningCount,
    issues,
  };
}

function evaluateProvider(
  provider: GenerationProviderDescriptor,
  addIssue: (issue: IssueInput) => void,
) {
  if (provider.availability !== "active") {
    addIssue({
      code: "PROVIDER_NOT_ACTIVE",
      severity: "error",
      message: "Generation provider is not active.",
      targetType: "provider",
      targetId: provider.id,
    });
  }

  if (provider.usesAi) {
    addIssue({
      code: "PROVIDER_USES_AI",
      severity: "error",
      message: "Generation provider uses AI and cannot be treated as local deterministic output.",
      targetType: "provider",
      targetId: provider.id,
    });
  }

  if (!provider.requiresCitations) {
    addIssue({
      code: "PROVIDER_DOES_NOT_REQUIRE_CITATIONS",
      severity: "error",
      message: "Generation provider does not require citations.",
      targetType: "provider",
      targetId: provider.id,
    });
  }

  if (!provider.preservesCitationIds) {
    addIssue({
      code: "PROVIDER_DOES_NOT_PRESERVE_CITATIONS",
      severity: "error",
      message: "Generation provider does not preserve citation IDs.",
      targetType: "provider",
      targetId: provider.id,
    });
  }

  if (provider.allowsUncitedClaims) {
    addIssue({
      code: "PROVIDER_ALLOWS_UNCITED_CLAIMS",
      severity: "error",
      message: "Generation provider allows uncited claims.",
      targetType: "provider",
      targetId: provider.id,
    });
  }
}
