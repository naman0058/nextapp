import type { PreflightAnalysisResult } from "@/features/accessibility/types/preflight";
import { ComplianceDisclaimer } from "@/features/accessibility/components/checker/ComplianceDisclaimer";
import { ScoreCard } from "@/features/accessibility/components/checker/ScoreCard";
import { ResultsSummary } from "@/features/accessibility/components/checker/ResultsSummary";
import { Button } from "@/components/ui/Button";

type PreflightResultsDashboardProps = {
  results: PreflightAnalysisResult;
  onRefresh: () => void;
  inputsDirty?: boolean;
};

export function PreflightResultsDashboard({
  results,
  onRefresh,
  inputsDirty,
}: PreflightResultsDashboardProps) {
  return (
    <div
      aria-live="polite"
      className="space-y-4 xl:sticky xl:top-24"
    >
      {inputsDirty && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950">
          Inputs changed — refresh results to update this dashboard.
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-white via-white to-indigo-50/50 shadow-lg shadow-indigo-950/5">
        <div className="border-b border-border/80 bg-indigo-950 px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">
            Local preflight results
          </p>
          <p className="font-display text-sm font-semibold text-white">
            Accessibility readiness dashboard
          </p>
        </div>
        <div className="space-y-4 p-5">
          <ScoreCard score={results.score} bandLabel={results.scoreBandLabel} />
          <ResultsSummary counts={results.counts} />
          <ComplianceDisclaimer />
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onRefresh}>
            Refresh results
          </Button>
        </div>
      </div>
    </div>
  );
}
