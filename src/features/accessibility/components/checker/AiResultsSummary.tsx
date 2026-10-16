import type { AIImageAccessibilityAnalysis } from "@/features/accessibility/types/aiImageAnalysis";
import { ResultMetricTile } from "@/components/results/ResultMetricTile";

type AiResultsSummaryProps = {
  analysis: AIImageAccessibilityAnalysis;
};

export function AiResultsSummary({ analysis }: AiResultsSummaryProps) {
  const recommendationCount =
    analysis.userAltTextReview.issues.length +
    analysis.captionCoverage.missingInformation.length +
    (analysis.humanReview.required ? 1 : 0);

  return (
    <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-violet-800">
        Optional AI review
      </p>
      <h3 className="font-display mt-1 text-lg font-bold text-foreground">
        Image analysis summary
      </h3>
      <ul className="mt-4 grid list-none gap-2 sm:grid-cols-2">
        <li>
          <ResultMetricTile
            label="Items to review"
            value={recommendationCount}
            tone={recommendationCount > 0 ? "warning" : "success"}
          />
        </li>
        <li>
          <ResultMetricTile
            label="Human review"
            value={analysis.humanReview.required ? "Recommended" : "Not flagged"}
            tone={analysis.humanReview.required ? "warning" : "muted"}
          />
        </li>
      </ul>
    </div>
  );
}
