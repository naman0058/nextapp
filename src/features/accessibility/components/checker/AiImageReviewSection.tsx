"use client";

import type { AIImageAccessibilityAnalysis } from "@/features/accessibility/types/aiImageAnalysis";
import { AiResultsSummary } from "@/features/accessibility/components/checker/AiResultsSummary";
import { SuggestedAltTextCard } from "@/features/accessibility/components/checker/SuggestedAltTextCard";
import { AppPanel } from "@/components/app/AppPanel";
import { resultPanelClass } from "@/components/results/resultStyles";
import { cn } from "@/lib/utils";

const PURPOSE_LABELS: Record<
  AIImageAccessibilityAnalysis["imagePurpose"],
  string
> = {
  informational: "Informational",
  decorative: "Decorative",
  mixed: "Mixed",
  uncertain: "Uncertain",
};

const COVERAGE_LABELS: Record<
  AIImageAccessibilityAnalysis["captionCoverage"]["status"],
  string
> = {
  covered: "Covered",
  partially_covered: "Partial",
  not_covered: "Not covered",
  uncertain: "Uncertain",
};

type AiImageReviewSectionProps = {
  analysis: AIImageAccessibilityAnalysis;
  onUseSuggestedAlt: () => void;
  onUseImprovedAlt: (text: string) => void;
};

export function AiImageReviewSection({
  analysis,
  onUseSuggestedAlt,
  onUseImprovedAlt,
}: AiImageReviewSectionProps) {
  return (
    <AppPanel
      title="AI image accessibility review"
      description="Model-generated suggestions—verify against the image before publishing."
      className="space-y-4"
    >
      <AiResultsSummary analysis={analysis} />

      <div className={resultPanelClass}>
        <h3 className="font-display text-base font-bold text-foreground">
          AI image assessment
        </h3>
        <p className="mt-2 text-sm text-foreground">
          {PURPOSE_LABELS[analysis.imagePurpose]}
        </p>
        <p className="mt-1 text-xs text-muted">
          AI assessment only—not a legal or platform classification.
        </p>
      </div>

      <SuggestedAltTextCard
        suggestedAltText={analysis.suggestedAltText}
        rationale={analysis.altTextRationale}
        onUseAsAltText={onUseSuggestedAlt}
      />

      {analysis.visibleText.length > 0 && (
        <div className={resultPanelClass}>
          <h3 className="font-display text-base font-bold text-foreground">
            AI-detected visible text
          </h3>
          <p className="mt-1 text-xs text-muted">
            Verify exact wording, dates, numbers, prices, and contact details
            manually.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground">
            {analysis.visibleText.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.importantVisualDetails.length > 0 && (
        <div className={resultPanelClass}>
          <h3 className="font-display text-base font-bold text-foreground">
            Important visual details
          </h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground">
            {analysis.importantVisualDetails.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={resultPanelClass}>
        <h3 className="font-display text-base font-bold text-foreground">
          Caption coverage
        </h3>
        <p className="mt-2 text-sm text-foreground">
          {COVERAGE_LABELS[analysis.captionCoverage.status]}
        </p>
        {analysis.captionCoverage.missingInformation.length > 0 && (
          <>
            <p className="mt-2 text-sm text-muted">
              Potentially missing from caption:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
              {analysis.captionCoverage.missingInformation.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className={resultPanelClass}>
        <h3 className="font-display text-base font-bold text-foreground">
          Your alt text review
        </h3>
        <p className="mt-2 text-sm text-foreground">
          Status: {analysis.userAltTextReview.status.replaceAll("_", " ")}
        </p>
        {analysis.userAltTextReview.issues.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
            {analysis.userAltTextReview.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        )}
        {analysis.userAltTextReview.improvedAltText && (
          <div className="mt-3">
            <p className="text-sm font-semibold text-foreground">
              AI suggested improvement
            </p>
            <p className="mt-1 text-sm text-foreground">
              {analysis.userAltTextReview.improvedAltText}
            </p>
            <button
              type="button"
              className="mt-2 text-sm font-semibold text-primary hover:underline"
              onClick={() =>
                onUseImprovedAlt(analysis.userAltTextReview.improvedAltText!)
              }
            >
              Use suggestion
            </button>
          </div>
        )}
      </div>

      {analysis.humanReview.required && (
        <div className={cn(resultPanelClass, "border-amber-200 bg-amber-50")}>
          <h3 className="font-display text-base font-bold text-foreground">
            Human review recommended
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
            {analysis.humanReview.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.limitations.length > 0 && (
        <div className={resultPanelClass}>
          <h3 className="font-display text-base font-bold text-foreground">
            AI limitations
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
            {analysis.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </AppPanel>
  );
}
