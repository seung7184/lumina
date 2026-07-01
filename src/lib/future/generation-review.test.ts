import { describe, expect, it } from "vitest";
import {
  approveGenerationReview,
  createInitialGenerationReview,
  rejectGenerationReview,
  resetGenerationReviewForSourceChange,
} from "@/lib/future/generation-review";
import { generateDeterministicBrief } from "@/lib/future/brief-generator";
import { luminaDemo } from "@/lib/mock/lumina-demo";
import type { DeterministicBrief } from "@/lib/types/workspace";

function generatedBrief() {
  return generateDeterministicBrief({
    source: luminaDemo.source,
    segments: luminaDemo.segments,
    citations: luminaDemo.summaries.en.citations,
  });
}

function blockedBrief(): DeterministicBrief {
  const brief = generatedBrief();

  return {
    ...brief,
    generationPolicy: {
      id: "policy-review-blocked",
      briefId: brief.id,
      providerId: brief.providerId,
      allowedToDisplay: false,
      allowedToUseAsSourceGrounded: false,
      issueCount: 1,
      errorCount: 1,
      warningCount: 0,
      issues: [
        {
          id: "policy-review-blocked-issue-1",
          code: "PROVIDER_USES_AI",
          severity: "error",
          message: "Generation provider uses AI and cannot be treated as local deterministic output.",
          targetType: "provider",
          targetId: brief.providerId,
        },
      ],
    },
  };
}

describe("generation review workflow", () => {
  it("starts generated briefs as needs_review when policy and audit allow source-grounded display", () => {
    const brief = generatedBrief();

    expect(createInitialGenerationReview(brief)).toEqual({
      id: `review-${brief.id}`,
      briefId: brief.id,
      status: "needs_review",
      reviewerNote: "",
      canApprove: true,
      sourceGrounded: true,
    });
  });

  it("approves only when policy allows display and citation audit passed", () => {
    const brief = generatedBrief();

    expect(approveGenerationReview({ brief, note: "Looks grounded." })).toEqual({
      id: `review-${brief.id}`,
      briefId: brief.id,
      status: "approved",
      reviewerNote: "Looks grounded.",
      canApprove: true,
      sourceGrounded: true,
    });

    const blocked = blockedBrief();
    expect(approveGenerationReview({ brief: blocked, note: "Cannot approve yet." })).toEqual({
      id: `review-${blocked.id}`,
      briefId: blocked.id,
      status: "needs_review",
      reviewerNote: "Cannot approve yet.",
      canApprove: false,
      sourceGrounded: false,
    });
  });

  it("records rejected state without claiming final production status", () => {
    const brief = generatedBrief();

    expect(rejectGenerationReview({ brief, note: "Needs another pass." })).toEqual({
      id: `review-${brief.id}`,
      briefId: brief.id,
      status: "rejected",
      reviewerNote: "Needs another pass.",
      canApprove: true,
      sourceGrounded: true,
    });
  });

  it("resets review state on source changes", () => {
    expect(resetGenerationReviewForSourceChange()).toBeNull();
  });
});
