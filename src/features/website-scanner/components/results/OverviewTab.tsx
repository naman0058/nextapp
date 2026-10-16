"use client";

import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import { StartHereCard } from "@/features/website-scanner/components/results/StartHereCard";
import { RootCauseCard } from "@/features/website-scanner/components/results/RootCauseCard";
import { WcagCoverageMatrix } from "@/features/website-scanner/components/results/WcagCoverageMatrix";
import { ScanQualityPanel } from "@/features/website-scanner/components/results/ScanQualityPanel";
import { ViewportComparisonPanel } from "@/features/website-scanner/components/results/ViewportComparisonPanel";
import {
  aggregateScanCompleteness,
  scanCompletenessLabel,
} from "@/features/website-scanner/utils/scanCompletenessAggregate";
import {
  getStartHereItems,
  pagesByIssueCount,
  sortRootCauseGroups,
} from "@/features/website-scanner/utils/issueViewModels";

type Props = {
  intel: SiteScanIntelligence | null;
  completedPages: WebsitePageScanResult[];
  totalIncomplete: number;
};

export function OverviewTab({ intel, completedPages, totalIncomplete }: Props) {
  const { dispatch } = useWebsiteScanSession();
  const completeness = aggregateScanCompleteness(completedPages);
  const showAlert =
    completeness === "partial" ||
    completeness === "limited" ||
    completeness === "failed";
  const startHere = intel ? getStartHereItems(intel.fixPlan) : [];
  const rootGroups = intel
    ? sortRootCauseGroups(intel.rootCauseGroups).slice(0, 5)
    : [];
  const hotspots = intel
    ? pagesByIssueCount(intel.ruleAggregates, completedPages).slice(0, 5)
    : [];
  const uniqueIssues = intel?.summary.uniqueAutomatedRules ?? 0;
  const noViolations = uniqueIssues === 0;

  return (
    <div className="space-y-6">
      {showAlert && (
        <div role="alert" className="rounded-lg border border-amber-600 bg-amber-50 p-4 text-sm dark:bg-amber-950/30">
          <strong>Scan completeness: {scanCompletenessLabel(completeness)}.</strong>{" "}
          Some pages may have loaded partially or hit limits. Treat missing coverage
          as unknown risk until you rescan or review manually.
        </div>
      )}

      <ScanQualityPanel pages={completedPages} />
      <ViewportComparisonPanel />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard label="Unique automated issues" value={uniqueIssues} />
        <SummaryCard
          label="Likely root causes"
          value={intel?.summary.likelyRootCauses ?? 0}
        />
        <SummaryCard
          label="Total elements (occurrences)"
          value={intel?.summary.totalOccurrences ?? 0}
        />
        <SummaryCard label="Human review (axe incomplete)" value={totalIncomplete} />
        <SummaryCard label="Pages scanned" value={completedPages.length} />
        <SummaryCard label="Completeness" value={scanCompletenessLabel(completeness)} />
      </div>

      {noViolations ? (
        <div className="rounded-lg border border-border p-6 text-center">
          <p className="font-semibold">No automated WCAG violations detected</p>
          <p className="mt-2 text-sm text-muted">
            Automated scans still miss many requirements. Continue with guided human
            review.
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            onClick={() =>
              dispatch({ type: "SET_RESULT_VIEW", view: "human-review" })
            }
          >
            Start human review
          </button>
        </div>
      ) : (
        <>
          <section>
            <h3 className="font-display text-lg font-bold">Start here</h3>
            <p className="mt-1 text-sm text-muted">
              Top priorities from your fix plan — not a score.
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {startHere.map((item) => {
                const group = intel?.rootCauseGroups.find(
                  (g) => g.id === item.rootCauseGroupId,
                );
                return (
                  <StartHereCard
                    key={item.rank}
                    item={item}
                    sharedFixHint={
                      item.likelySharedFix &&
                      (group?.confidence ?? "low") !== "low"
                    }
                  />
                );
              })}
            </div>
          </section>

          {rootGroups.length > 0 && (
            <section>
              <h3 className="font-display text-lg font-bold">Root cause summary</h3>
              <ul className="mt-3 space-y-3">
                {rootGroups.map((g) => {
                  const f = intel?.normalizedFindings.find(
                    (x) => x.ruleId === g.ruleId,
                  );
                  return (
                    <RootCauseCard key={g.id} group={g} impact={f?.impact} />
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}

      {intel && intel.wcagCoverage.length > 0 && (
        <WcagCoverageMatrix coverage={intel.wcagCoverage} />
      )}

      {hotspots.length > 0 && (
        <section>
          <h3 className="font-display text-lg font-bold">Page hotspots</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {hotspots.map((h) => (
              <li key={h.pageUrl}>
                <span className="font-medium">{h.uniqueIssues}</span> unique issue(s) —{" "}
                <span className="break-all text-muted">{h.pageUrl}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
