"use client";

import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import { RootCauseCard } from "@/features/website-scanner/components/results/RootCauseCard";
import { WcagCoverageMatrix } from "@/features/website-scanner/components/results/WcagCoverageMatrix";
import { ViewportComparisonPanel } from "@/features/website-scanner/components/results/ViewportComparisonPanel";
import { AffectedAreasSection } from "@/features/website-scanner/components/results/overview/AffectedAreasSection";
import { CoverageDiagnosticSection } from "@/features/website-scanner/components/results/overview/CoverageDiagnosticSection";
import { OverviewScopeStrip } from "@/features/website-scanner/components/results/overview/OverviewScopeStrip";
import { PreflightSnapshotSection } from "@/features/website-scanner/components/results/overview/PreflightSnapshotSection";
import { TopRemediationPriorityCard } from "@/features/website-scanner/components/results/overview/TopRemediationPriorityCard";
import { HumanReviewOverviewStrip } from "@/features/website-scanner/components/results/overview/HumanReviewOverviewStrip";
import { sortRootCauseGroups } from "@/features/website-scanner/utils/issueViewModels";

type Props = {
  intel: SiteScanIntelligence | null;
  completedPages: WebsitePageScanResult[];
};

export function OverviewTab({ intel, completedPages }: Props) {
  const { dispatch } = useWebsiteScanSession();
  const exec = intel?.executivePreflight;
  const snapshot = exec?.snapshot;
  const noViolations = (snapshot?.failedAutomatedRules ?? 0) === 0;
  const sharedGroups = intel
    ? sortRootCauseGroups(intel.rootCauseGroups).filter(
        (g) => g.likelySharedComponent,
      )
    : [];

  return (
    <div className="space-y-8">
      <OverviewScopeStrip />

      {exec && snapshot && (
        <>
          <PreflightSnapshotSection snapshot={snapshot} />
          <CoverageDiagnosticSection rows={exec.coverageDiagnostic} />
        </>
      )}

      {snapshot && snapshot.passedAutomatedRules > 0 && (
        <p className="text-sm text-muted">
          {snapshot.passedAutomatedRules} automated rule
          {snapshot.passedAutomatedRules === 1 ? "" : "s"} passed on this
          scanned page state.{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-2 hover:underline"
            onClick={() => dispatch({ type: "SET_RESULT_VIEW", view: "coverage" })}
          >
            View coverage
          </button>
          <span
            className="ml-1 cursor-help border-b border-dotted border-muted"
            title="Passing automated checks does not establish WCAG compliance."
          >
            (not compliance)
          </span>
        </p>
      )}

      {exec && <AffectedAreasSection categories={exec.categorySummary} />}

      <HumanReviewOverviewStrip completedPages={completedPages} />

      {noViolations ? (
        <div className="rounded-lg border border-border p-6">
          <p className="font-semibold">
            No automated WCAG failures were detected in the scanned state.
          </p>
          <p className="mt-2 text-sm text-muted">
            This does not establish accessibility compliance. Manual review and
            incomplete checks may still apply.
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
        exec &&
        exec.topRemediationPriorities.length > 0 && (
          <section aria-labelledby="top-priorities-heading">
            <h3
              id="top-priorities-heading"
              className="font-display text-lg font-bold"
            >
              Top remediation priorities
            </h3>
            <p className="mt-1 text-sm text-muted">
              Highest-impact fixes from your plan — not a compliance score.
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {exec.topRemediationPriorities.map((item) => (
                <TopRemediationPriorityCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )
      )}

      {intel && (
        <section aria-labelledby="shared-root-heading">
          <h3 id="shared-root-heading" className="font-display text-lg font-bold">
            Shared remediation root causes
          </h3>
          {exec && exec.sharedRootCauseCount === 0 ? (
            <p className="mt-2 text-sm text-muted">
              No shared remediation root cause was confidently identified.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {sharedGroups.slice(0, 5).map((g) => {
                const f = intel.normalizedFindings.find(
                  (x) => x.ruleId === g.ruleId,
                );
                return (
                  <RootCauseCard key={g.id} group={g} impact={f?.impact} />
                );
              })}
            </ul>
          )}
        </section>
      )}

      <ViewportComparisonPanel />

      {intel && intel.wcagCoverage.length > 0 && (
        <WcagCoverageMatrix coverage={intel.wcagCoverage} />
      )}

      {exec && exec.pageHotspots.length > 0 && (
        <section aria-labelledby="page-hotspots-heading">
          <h3 id="page-hotspots-heading" className="font-display text-lg font-bold">
            Page hotspots
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {exec.pageHotspots.map((h) => (
              <li
                key={h.pageUrl}
                className="rounded-lg border border-border px-3 py-2"
              >
                <button
                  type="button"
                  className="break-all text-left font-medium text-primary underline-offset-2 hover:underline"
                  onClick={() =>
                    dispatch({
                      type: "OPEN_ISSUES_WITH_FILTER",
                      filter: { pageUrl: h.pageUrl, issueStatus: "actionable" },
                    })
                  }
                >
                  {h.pageUrl}
                </button>
                <p className="mt-1 text-muted">
                  {h.failedRules} failed rule{h.failedRules === 1 ? "" : "s"} ·{" "}
                  {h.affectedOccurrences} affected occurrence
                  {h.affectedOccurrences === 1 ? "" : "s"} ·{" "}
                  {h.seriousCriticalRules} serious/critical ·{" "}
                  {h.needsConfirmation} need confirmation · {h.completenessLabel}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {completedPages.length === 0 && (
        <p className="text-sm text-muted">No completed pages in this session.</p>
      )}
    </div>
  );
}
