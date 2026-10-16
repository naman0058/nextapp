import type { PreflightAnalysisResult } from "@/features/accessibility/types/preflight";
import { CheckResultCard } from "@/features/accessibility/components/checker/CheckResultCard";

type FindingsResultsPanelProps = {
  results: PreflightAnalysisResult;
  workingCaption: string;
  onApplyFix: (fixId: string, previewCaption: string) => void;
};

export function FindingsResultsPanel({
  results,
  workingCaption,
  onApplyFix,
}: FindingsResultsPanelProps) {
  const attention =
    results.counts.review + results.counts.fail;

  return (
    <section aria-labelledby="findings-results-heading" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            Detailed analysis
          </p>
          <h2
            id="findings-results-heading"
            className="font-display mt-1 text-2xl font-bold text-foreground"
          >
            All local findings
          </h2>
          <p className="mt-1 text-sm text-muted">
            {results.checks.length} checks · {attention} need your attention
          </p>
        </div>
      </div>

      <ul className="space-y-3">
        {results.checks.map((check) => (
          <li key={check.id} className="list-none">
            <CheckResultCard
              check={check}
              workingCaption={workingCaption}
              onApplyFix={onApplyFix}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
