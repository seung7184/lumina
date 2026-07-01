import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import type { ClaimValidationBlock as ClaimValidationBlockType } from "@/lib/types/workspace";

interface ClaimValidationBlockProps {
  block: ClaimValidationBlockType;
}

export function ClaimValidationBlock({ block }: ClaimValidationBlockProps) {
  const validation = block.validation;

  return (
    <section className="claim-block" aria-label={block.title}>
      <div className="claim-block__header">
        <span className="eyebrow accent">{block.title}</span>
        <span className="status-pill status-pill--warning">
          <AlertTriangle size={13} aria-hidden="true" />
          {validation.statusLabel}
        </span>
      </div>
      <h3>{validation.claim}</h3>
      <div className="claim-grid">
        <div>
          <CheckCircle2 size={17} aria-hidden="true" />
          <strong>Source evidence</strong>
          <p>{validation.sourceEvidence}</p>
        </div>
        <div>
          <ShieldCheck size={17} aria-hidden="true" />
          <strong>Counter-evidence</strong>
          <p>{validation.counterEvidence}</p>
        </div>
      </div>
      <div className="claim-block__footer">
        <span>{validation.coverageLabel}</span>
        <span>{validation.suggestedFollowUp}</span>
      </div>
    </section>
  );
}
