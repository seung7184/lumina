import type { DeterministicBrief, GenerationReviewState } from "@/lib/types/workspace";

export interface UpdateGenerationReviewInput {
  brief: DeterministicBrief;
  note?: string;
}

export function createInitialGenerationReview(brief: DeterministicBrief): GenerationReviewState {
  const sourceGrounded = isSourceGrounded(brief);

  return {
    id: `review-${brief.id}`,
    briefId: brief.id,
    status: "needs_review",
    reviewerNote: "",
    canApprove: sourceGrounded,
    sourceGrounded,
  };
}

export function approveGenerationReview(input: UpdateGenerationReviewInput): GenerationReviewState {
  const current = input.brief.review ?? createInitialGenerationReview(input.brief);
  const sourceGrounded = isSourceGrounded(input.brief);

  return {
    ...current,
    status: sourceGrounded ? "approved" : "needs_review",
    reviewerNote: input.note?.trim() ?? current.reviewerNote,
    canApprove: sourceGrounded,
    sourceGrounded,
  };
}

export function rejectGenerationReview(input: UpdateGenerationReviewInput): GenerationReviewState {
  const current = input.brief.review ?? createInitialGenerationReview(input.brief);
  const sourceGrounded = isSourceGrounded(input.brief);

  return {
    ...current,
    status: "rejected",
    reviewerNote: input.note?.trim() ?? current.reviewerNote,
    canApprove: sourceGrounded,
    sourceGrounded,
  };
}

export function resetGenerationReviewForSourceChange() {
  return null;
}

function isSourceGrounded(brief: DeterministicBrief) {
  return brief.generationPolicy?.allowedToDisplay === true && brief.citationAudit?.passed === true;
}
