import { adaptAxePageToFindings } from "@/features/accessibility-intelligence/adapters/adaptAxePage";
import { buildFixPlan } from "@/features/accessibility-intelligence/fixPlan/buildFixPlan";
import { groupRootCauses } from "@/features/accessibility-intelligence/grouping/groupRootCauses";
import { PRIORITY_EXPLANATION } from "@/features/accessibility-intelligence/priority/remediationPriority";
import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import { buildWcagCoverageMatrix } from "@/features/accessibility-intelligence/wcag/buildWcagCoverageMatrix";
import { aggregateSiteIssues } from "@/features/website-scanner/utils/aggregateSiteIssues";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { computeRemediationPriority } from "@/features/accessibility-intelligence/priority/remediationPriority";

export function buildSiteScanIntelligence(
  pages: WebsitePageScanResult[],
  options?: { generatedAt?: string },
): SiteScanIntelligence {
  const rootCauseGroups = groupRootCauses(pages);
  const ruleAggregates = aggregateSiteIssues(pages);
  const groupByRule = new Map<string, string>();
  for (const g of rootCauseGroups) {
    if (!groupByRule.has(g.ruleId) && g.likelySharedComponent) {
      groupByRule.set(g.ruleId, g.id);
    }
  }

  const normalizedFindings = pages.flatMap((p) =>
    adaptAxePageToFindings(p, groupByRule),
  );

  for (const finding of normalizedFindings) {
    if (finding.status !== "issue") continue;
    const group = rootCauseGroups.find(
      (g) => g.ruleId === finding.ruleId && g.likelySharedComponent,
    );
    const agg = ruleAggregates.find((r) => r.ruleId === finding.ruleId);
    const { priority } = computeRemediationPriority({
      impact: finding.impact,
      occurrenceCount: agg?.totalNodeCount ?? finding.occurrenceCount ?? 1,
      affectedPageCount: agg?.affectedPageCount ?? 1,
      likelySharedComponent: group?.likelySharedComponent ?? false,
      sharedConfidence: group?.confidence ?? "low",
      wcagLevel: finding.wcagLevel ?? null,
      humanReviewRequired: finding.humanReviewRequired,
    });
    finding.priority = priority;
    if (group) finding.rootCauseGroupId = group.id;
  }

  const pagesWithViolations = pages.filter((p) =>
    p.violations.some((v) => !v.isBestPractice),
  ).length;
  const completePages = pages.filter(
    (p) => p.scanCompleteness === "complete" || !p.scanCompleteness,
  ).length;
  const partialPages = pages.filter(
    (p) =>
      p.scanCompleteness === "partial" || p.scanCompleteness === "limited",
  ).length;

  return {
    generatedAt: options?.generatedAt ?? new Date().toISOString(),
    summary: {
      pagesScanned: pages.length,
      completePages,
      partialPages,
      pagesWithViolations,
      uniqueAutomatedRules: ruleAggregates.filter((r) => !r.isBestPractice)
        .length,
      likelyRootCauses: rootCauseGroups.filter((g) => g.likelySharedComponent)
        .length,
      totalOccurrences: ruleAggregates.reduce(
        (n, r) => n + r.totalNodeCount,
        0,
      ),
      humanReviewItems: normalizedFindings.filter((f) => f.humanReviewRequired)
        .length,
      bestPracticeFindings: normalizedFindings.filter((f) => f.bestPractice)
        .length,
    },
    normalizedFindings,
    rootCauseGroups,
    ruleAggregates,
    wcagCoverage: buildWcagCoverageMatrix(pages),
    fixPlan: buildFixPlan(rootCauseGroups, ruleAggregates),
    priorityExplanation: PRIORITY_EXPLANATION,
  };
}
