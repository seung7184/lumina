import type { LanguageCode } from "@/lib/types/workspace";
import { labels } from "@/lib/i18n/labels";

interface GroundingLegendProps {
  language: LanguageCode;
  sourceCoverage: number;
}

export function GroundingLegend({ language, sourceCoverage }: GroundingLegendProps) {
  const copy = labels[language];

  return (
    <section className="grounding-legend" aria-label={copy.grounding}>
      <span className="eyebrow">{copy.grounding}</span>
      <span className="legend-item">
        <span className="legend-dot legend-dot--source" />
        {copy.fromSource}
      </span>
      <span className="legend-item">
        <span className="legend-dot legend-dot--inferred" />
        {copy.aiInferred}
      </span>
      <span className="legend-item">
        <span className="legend-dot legend-dot--verify" />
        {copy.needsVerification}
      </span>
      <span className="legend-coverage">{sourceCoverage}% from source</span>
    </section>
  );
}
