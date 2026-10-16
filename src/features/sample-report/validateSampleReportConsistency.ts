import { compareScanSnapshots } from "@/features/website-scanner/utils/compareScanSnapshots";
import type { SampleAccessibilityReportFixture } from "@/features/sample-report/buildSampleAccessibilityReportFixture";

export type SampleValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };

function countOccurrences(pages: SampleAccessibilityReportFixture["completedPages"]): number {
  let n = 0;
  for (const page of pages) {
    for (const v of page.violations) {
      if (v.isBestPractice) continue;
      n += v.totalNodeCount;
    }
  }
  return n;
}

export function validateSampleReportConsistency(
  fixture: SampleAccessibilityReportFixture,
): SampleValidationResult {
  const errors: string[] = [];
  const { session, completedPages, rescanDemo } = fixture;
  const intel = session.siteIntelligence;

  if (!intel) {
    errors.push("siteIntelligence is missing");
    return { ok: false, errors };
  }

  const completePages = session.pages.filter((p) => p.status === "complete");
  if (completePages.length !== session.scanScope.pagesCompleted) {
    errors.push(
      `pagesCompleted (${session.scanScope.pagesCompleted}) !== complete page entries (${completePages.length})`,
    );
  }

  const likelyShared = intel.rootCauseGroups.filter((g) => g.likelySharedComponent).length;
  if (intel.summary.likelyRootCauses !== likelyShared) {
    errors.push("summary.likelyRootCauses does not match likely shared root cause count");
  }

  const aggregateOccurrences = intel.ruleAggregates.reduce((n, r) => n + r.totalNodeCount, 0);
  if (intel.summary.totalOccurrences !== aggregateOccurrences) {
    errors.push("summary.totalOccurrences does not match rule aggregate totals");
  }

  const fixtureOccurrences = countOccurrences(completedPages);
  if (aggregateOccurrences !== fixtureOccurrences) {
    errors.push(
      `rule aggregate occurrences (${aggregateOccurrences}) !== page violation nodes (${fixtureOccurrences})`,
    );
  }

  for (const item of intel.fixPlan) {
    if (item.rootCauseGroupId && !intel.rootCauseGroups.some((g) => g.id === item.rootCauseGroupId)) {
      errors.push(`fix plan references unknown root cause ${item.rootCauseGroupId}`);
    }
  }

  if (intel.wcagCoverage.length === 0) {
    errors.push("wcagCoverage is empty");
  }

  const comparison = compareScanSnapshots(rescanDemo.previous, rescanDemo.current);
  if (comparison.resolved < 1) {
    errors.push("rescan demo should show at least one resolved issue");
  }

  if (session.viewportMode === "compare" && !session.viewportComparisonSummary) {
    errors.push("viewport comparison summary missing in compare mode");
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}
