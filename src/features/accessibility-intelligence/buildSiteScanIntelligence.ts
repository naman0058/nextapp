import { adaptAxePageToFindings } from "@/features/accessibility-intelligence/adapters/adaptAxePage";
import { buildFixPlan } from "@/features/accessibility-intelligence/fixPlan/buildFixPlan";
import { groupRootCauses } from "@/features/accessibility-intelligence/grouping/groupRootCauses";
import { PRIORITY_EXPLANATION } from "@/features/accessibility-intelligence/priority/remediationPriority";
import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import { buildWcagCoverageMatrix } from "@/features/accessibility-intelligence/wcag/buildWcagCoverageMatrix";
import { aggregateSiteIssues } from "@/features/website-scanner/utils/aggregateSiteIssues";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { computeRemediationPriority } from "@/features/accessibility-intelligence/priority/remediationPriority";
import { WEBSITE_MANUAL_REVIEW_ITEMS } from "@/features/website-scanner/constants/manualReviewChecklist";
import { buildScanResultModel } from "@/features/website-scanner/taxonomy/buildScanResultModel";
import { buildExecutivePreflight } from "@/features/website-scanner/executive/buildExecutivePreflight";
import { buildFindingDetails } from "@/features/website-scanner/findingDetail/buildFindingDetails";

export function buildSiteScanIntelligence(
  pages: WebsitePageScanResult[],
  options?: {
    generatedAt?: string;
    includeBestPractices?: boolean;
    humanReviewTasks?: number;
    urlsSelected?: number;
  },
): SiteScanIntelligence {
  const rootCauseGroups = groupRootCauses(pages);
  const ruleAggregates = aggregateSiteIssues(pages);
  const groupByRule = new Map<string, string>();
  for (const g of rootCauseGroups) {
    const existingId = groupByRule.get(g.ruleId);
    if (!existingId) {
      groupByRule.set(g.ruleId, g.id);
      continue;
    }
    const existing = rootCauseGroups.find((x) => x.id === existingId);
    if (!existing) {
      groupByRule.set(g.ruleId, g.id);
      continue;
    }
    const prefer =
      (g.likelySharedComponent && !existing.likelySharedComponent) ||
      (g.groupType === "rule_consolidated" &&
        existing.groupType !== "rule_consolidated") ||
      g.totalOccurrences > existing.totalOccurrences;
    if (prefer) groupByRule.set(g.ruleId, g.id);
  }

  const normalizedFindings = pages.flatMap((p) =>
    adaptAxePageToFindings(p, groupByRule),
  );

  for (const finding of normalizedFindings) {
    if (finding.status !== "issue") continue;
    const groupId = groupByRule.get(finding.ruleId ?? "");
    const group = groupId
      ? rootCauseGroups.find((g) => g.id === groupId)
      : undefined;
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
    if (groupId) finding.rootCauseGroupId = groupId;
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

  const wcagOccurrences = ruleAggregates
    .filter((r) => !r.isBestPractice)
    .reduce((n, r) => n + r.totalNodeCount, 0);

  const scanResultModel = buildScanResultModel(pages, {
    includeBestPractices: options?.includeBestPractices ?? true,
    humanReviewTasks:
      options?.humanReviewTasks ?? WEBSITE_MANUAL_REVIEW_ITEMS.length,
    generatedAt: options?.generatedAt,
  });
  scanResultModel.summary.affectedOccurrences = wcagOccurrences;
  scanResultModel.summary.failedAutomatedRules =
    ruleAggregates.filter((r) => !r.isBestPractice).length;

  const intel: SiteScanIntelligence = {
    generatedAt: options?.generatedAt ?? new Date().toISOString(),
    scanResultModel,
    executivePreflight: {
      snapshot: {
        failedAutomatedRules: 0,
        affectedOccurrences: 0,
        pagesScanned: pages.length,
        needsManualConfirmation: 0,
        humanReviewOpen: 0,
        coverageStatusLabel: "Complete",
        bestPracticeObservations: 0,
        passedAutomatedRules: 0,
        preflightStatusPhrase: "",
      },
      categorySummary: [],
      coverageDiagnostic: [],
      topRemediationPriorities: [],
      pageHotspots: [],
      ruleRollups: [],
      sharedRootCauseCount: 0,
    },
    summary: {
      pagesScanned: pages.length,
      completePages,
      partialPages,
      pagesWithViolations,
      uniqueAutomatedRules: ruleAggregates.filter((r) => !r.isBestPractice)
        .length,
      likelyRootCauses: rootCauseGroups.filter((g) => g.likelySharedComponent)
        .length,
      sharedRootCauses: rootCauseGroups.filter((g) => g.likelySharedComponent)
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
    findingDetails: [],
  };

  intel.executivePreflight = buildExecutivePreflight({
    pages,
    scanResultModel,
    intel,
    urlsSelected: options?.urlsSelected ?? pages.length,
  });

  intel.findingDetails = buildFindingDetails(pages, intel);

  return intel;
}
