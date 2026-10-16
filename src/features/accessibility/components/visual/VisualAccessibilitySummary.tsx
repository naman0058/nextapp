import type { ContrastEvaluation } from "@/features/accessibility/types/visualAccessibility";
import type { VisualChecklistState } from "@/features/accessibility/types/visualAccessibility";
import { ResultMetricTile } from "@/components/results/ResultMetricTile";

type VisualAccessibilitySummaryProps = {
  evaluation: ContrastEvaluation | null;
  checklist: VisualChecklistState;
  aiObservationCount: number;
};

function countChecklistReview(checklist: VisualChecklistState): number {
  const keys = Object.keys(checklist) as (keyof VisualChecklistState)[];
  return keys.filter((k) => {
    const v = checklist[k];
    if (v === null) return false;
    if (k === "understandableWithoutColor") {
      return v === "no" || v === "not_sure";
    }
    return v === "yes" || v === "not_sure";
  }).length;
}

export function VisualAccessibilitySummary({
  evaluation,
  checklist,
  aiObservationCount,
}: VisualAccessibilitySummaryProps) {
  const measuredPass = evaluation?.primaryVerdict === "pass" ? 1 : 0;
  const measuredFail = evaluation?.primaryVerdict === "fail" ? 1 : 0;
  const reviewItems = countChecklistReview(checklist);

  return (
    <div className="rounded-3xl border border-border bg-slate-50/80 p-5">
      <h4 className="font-display text-sm font-bold text-foreground">Visual summary</h4>
      <p className="mt-1 text-xs text-muted">
        Measured contrast plus human review prompts and optional AI observations.
      </p>
      <ul className="mt-4 grid list-none gap-2 sm:grid-cols-2">
        <li>
          <ResultMetricTile
            label="Contrast passed"
            value={measuredPass}
            tone={measuredPass ? "success" : "muted"}
          />
        </li>
        <li>
          <ResultMetricTile
            label="Contrast failed"
            value={measuredFail}
            tone={measuredFail ? "danger" : "muted"}
          />
        </li>
        <li>
          <ResultMetricTile
            label="Human review prompts"
            value={reviewItems}
            tone={reviewItems ? "warning" : "default"}
          />
        </li>
        <li>
          <ResultMetricTile
            label="AI observations"
            value={aiObservationCount}
            hint="Not measured as WCAG pass/fail"
            tone="default"
          />
        </li>
      </ul>
    </div>
  );
}
