import type {
  FixPlanItem,
  RootCauseGroup,
} from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { SiteRuleAggregate } from "@/features/website-scanner/types/scanTypes";

export function getStartHereItems(
  fixPlan: FixPlanItem[],
  max = 5,
): FixPlanItem[] {
  return [...fixPlan].sort((a, b) => a.rank - b.rank).slice(0, max);
}

export function sortRootCauseGroups(
  groups: RootCauseGroup[],
): RootCauseGroup[] {
  return [...groups].sort(
    (a, b) => b.totalOccurrences - a.totalOccurrences,
  );
}

export function pagesByIssueCount(
  aggregates: SiteRuleAggregate[],
  pages: { finalUrl: string; violations: { id: string; isBestPractice: boolean }[] }[],
): { pageUrl: string; uniqueIssues: number }[] {
  const counts = new Map<string, Set<string>>();
  for (const page of pages) {
    const set = new Set<string>();
    for (const v of page.violations) {
      if (!v.isBestPractice) set.add(v.id);
    }
    counts.set(page.finalUrl, set);
  }
  return [...counts.entries()]
    .map(([pageUrl, set]) => ({ pageUrl, uniqueIssues: set.size }))
    .sort((a, b) => b.uniqueIssues - a.uniqueIssues);
}

export function wcagCoverageCounts(
  coverage: {
    automation: string;
    manualReviewStatus: string;
  }[],
): {
  automated: number;
  partial: number;
  manual: number;
  manualCompleted: number;
} {
  let automated = 0;
  let partial = 0;
  let manual = 0;
  let manualCompleted = 0;
  for (const row of coverage) {
    if (row.automation === "automated") automated += 1;
    else if (row.automation === "partial") partial += 1;
    else manual += 1;
    if (
      row.manualReviewStatus === "completed_pass" ||
      row.manualReviewStatus === "completed_review"
    ) {
      manualCompleted += 1;
    }
  }
  return { automated, partial, manual, manualCompleted };
}
