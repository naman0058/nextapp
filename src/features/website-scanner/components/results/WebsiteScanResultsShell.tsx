"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ResultViewTab } from "@/features/website-scanner/types/resultUx";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import { compareScanSnapshots } from "@/features/website-scanner/utils/compareScanSnapshots";
import { exportComparisonCsv } from "@/features/website-scanner/utils/export/exportComparisonCsv";
import { OverviewTab } from "@/features/website-scanner/components/results/OverviewTab";
import { IssuesTab } from "@/features/website-scanner/components/results/IssuesTab";
import { FixPlanTab } from "@/features/website-scanner/components/results/FixPlanTab";
import { HumanReviewTab } from "@/features/website-scanner/components/results/HumanReviewTab";
import { ReportTab } from "@/features/website-scanner/components/results/ReportTab";
import { CoverageTab } from "@/features/website-scanner/components/results/CoverageTab";
import { RescanComparisonBanner } from "@/features/website-scanner/components/results/RescanComparisonBanner";
import { ScanScopeBanner } from "@/features/website-scanner/components/results/ScanScopeBanner";
import { PageInventoryPanel } from "@/features/website-scanner/components/results/PageInventoryPanel";
import { WebsiteExportMenu } from "@/features/website-scanner/components/results/WebsiteExportMenu";
import { VisualLocatorProvider } from "@/features/website-scanner/components/visualLocator/VisualLocatorProvider";
import { WorkspaceReturnCoordinator } from "@/features/accessibility-workspace/components/WorkspaceReturnCoordinator";

const TABS: { id: ResultViewTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "issues", label: "Issues" },
  { id: "fix-plan", label: "Fix plan" },
  { id: "human-review", label: "Human review" },
  { id: "coverage", label: "Coverage" },
  { id: "inventory", label: "Page inventory" },
  { id: "report", label: "Report" },
];

type Props = {
  completedPages: WebsitePageScanResult[];
  onRescan: (saveSnapshot?: boolean) => void;
  syncViewToUrl?: (view: ResultViewTab) => void;
};

export function WebsiteScanResultsShell({
  completedPages,
  onRescan,
  syncViewToUrl,
}: Props) {
  const { state, dispatch } = useWebsiteScanSession();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lastFocusCompletion = useRef<string | null>(null);

  const comparison = useMemo(() => {
    if (!state.previousSnapshot || completedPages.length === 0) return null;
    return compareScanSnapshots(state.previousSnapshot, completedPages);
  }, [state.previousSnapshot, completedPages]);

  const intel = state.siteIntelligence;
  useEffect(() => {
    if (!state.completedAt || state.status === "scanning") return;
    if (lastFocusCompletion.current === state.completedAt) return;
    lastFocusCompletion.current = state.completedAt;
    headingRef.current?.focus();
  }, [state.completedAt, state.status]);

  function selectTab(view: ResultViewTab) {
    dispatch({ type: "SET_RESULT_VIEW", view });
    syncViewToUrl?.(view);
  }

  const active = state.resultView;

  return (
    <VisualLocatorProvider
      scanSessionKey={state.completedAt}
      completedPages={completedPages}
    >
    <WorkspaceReturnCoordinator />
    <section
      className="space-y-6 rounded-2xl border border-border bg-card p-6"
      aria-labelledby="scan-results-heading"
    >
      <header>
        <h2
          id="scan-results-heading"
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-xl font-bold outline-none"
        >
          Accessibility scan results
        </h2>
        <p className="mt-1 text-sm text-muted">
          {completedPages.length} page(s) scanned · guided remediation workflow
        </p>
        <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
          Automated tools cannot evaluate every accessibility requirement. Human
          review remains necessary. This is not legal advice or certification.
        </p>
        <p className="mt-2 text-xs text-muted">
          Results are stored only in this browser session. Export before closing
          the page.
        </p>
      </header>

      <ScanScopeBanner />

      {comparison && (
        <RescanComparisonBanner
          comparison={comparison}
          onExportComparison={() => exportComparisonCsv(comparison.rows)}
        />
      )}

      <WebsiteExportMenu
        completedPages={completedPages}
        onRescan={() => onRescan(true)}
      />

      <div
        className="-mx-2 flex gap-1 overflow-x-auto px-2 pb-1"
        role="tablist"
        aria-label="Results sections"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={`shrink-0 rounded-lg border px-3 py-2 text-sm ${
              active === tab.id
                ? "border-primary bg-primary/10 font-semibold"
                : "border-border"
            }`}
            onClick={() => selectTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="min-h-[12rem]"
      >
        {active === "overview" && (
          <OverviewTab intel={intel} completedPages={completedPages} />
        )}
        {active === "issues" && (
          <IssuesTab intel={intel} completedPages={completedPages} />
        )}
        {active === "fix-plan" && (
          <FixPlanTab
            intel={intel}
            completedPages={completedPages}
            onRescanVerify={() => onRescan(true)}
          />
        )}
        {active === "human-review" && (
          <HumanReviewTab completedPages={completedPages} />
        )}
        {active === "coverage" && <CoverageTab intel={intel} />}
        {active === "inventory" && <PageInventoryPanel />}
        {active === "report" && <ReportTab completedPages={completedPages} />}
      </div>
    </section>
    </VisualLocatorProvider>
  );
}
