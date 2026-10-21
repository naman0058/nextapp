import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import { getUserImpactForRule } from "@/features/accessibility-intelligence/knowledge/ruleKnowledge";
import { getStartHereItems } from "@/features/website-scanner/utils/issueViewModels";
import { formatRetainedEvidenceNote } from "@/features/website-scanner/utils/occurrenceCounts";
import type {
  CategoryAreaSummary,
  CoverageDiagnosticRow,
  ExecutiveSnapshot,
  PageHotspotRow,
  RuleViewportOccurrences,
  SiteExecutivePreflight,
  TopRemediationPriority,
} from "@/features/website-scanner/executive/types";
import type { ScanResultModel } from "@/features/website-scanner/taxonomy/types";
import type { ProductFindingCategory } from "@/features/website-scanner/taxonomy/types";
import {
  aggregateEvidenceReporting,
  aggregatePageExecution,
  buildPageScanDiagnostic,
  buildSiteScanDiagnostics,
  formatEvidenceReportingLabel,
  formatPageExecutionLabel,
} from "@/features/website-scanner/utils/pageScanDiagnostics";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

function coverageStatusLabel(
  pageExecution: ReturnType<typeof aggregatePageExecution>,
  evidenceReporting: ReturnType<typeof aggregateEvidenceReporting>,
): string {
  if (pageExecution !== "complete") {
    return `Execution ${formatPageExecutionLabel(pageExecution).toLowerCase()}`;
  }
  if (evidenceReporting === "limited") return "Evidence limited";
  return "Complete";
}

function preflightStatusPhrase(failedRules: number, needsConfirmation: number): string {
  if (failedRules > 0) return "Important automated findings identified";
  if (needsConfirmation > 0) return "Manual confirmation remains";
  return "No automated WCAG failures in scanned state";
}

function buildCategorySummary(model: ScanResultModel): CategoryAreaSummary[] {
  const byCat = new Map<
    ProductFindingCategory,
    {
      failRules: Set<string>;
      occurrences: number;
      confirmations: number;
      pages: Set<string>;
    }
  >();

  for (const entry of model.ledger) {
    if (entry.filteringReason) continue;
    const isFail =
      entry.axeBucket === "violation" && !entry.isBestPractice;
    const isConfirm = entry.axeBucket === "incomplete";
    if (!isFail && !isConfirm) continue;

    let bucket = byCat.get(entry.productCategory);
    if (!bucket) {
      bucket = {
        failRules: new Set(),
        occurrences: 0,
        confirmations: 0,
        pages: new Set(),
      };
      byCat.set(entry.productCategory, bucket);
    }
    if (isFail) {
      bucket.failRules.add(entry.ruleId);
      bucket.occurrences += entry.occurrenceCount;
      bucket.pages.add(entry.pageUrl);
    } else if (isConfirm) {
      bucket.confirmations += 1;
      bucket.pages.add(entry.pageUrl);
    }
  }

  return [...byCat.entries()]
    .map(([category, b]) => ({
      category,
      failedRuleCount: b.failRules.size,
      affectedOccurrences: b.occurrences,
      confirmationNeededCount: b.confirmations,
      pagesAffected: b.pages.size,
    }))
    .filter(
      (c) => c.failedRuleCount > 0 || c.confirmationNeededCount > 0,
    )
    .sort(
      (a, b) =>
        b.affectedOccurrences - a.affectedOccurrences ||
        b.failedRuleCount - a.failedRuleCount,
    );
}

function buildCoverageDiagnostic(
  pages: WebsitePageScanResult[],
  model: ScanResultModel,
  pagesScanned: number,
  urlsSelected: number,
): CoverageDiagnosticRow[] {
  const pageExecution = aggregatePageExecution(pages);
  const evidenceReporting = aggregateEvidenceReporting(pages);
  const diagnostics = buildSiteScanDiagnostics(pages);
  const executionReasons = diagnostics.flatMap((d) => d.executionReasons);
  const evidenceReasons = diagnostics.flatMap((d) => d.evidenceReasons);

  const totalOcc = pages.reduce(
    (n, p) => n + (p.nodeReporting?.totalOccurrences ?? 0),
    0,
  );
  const retained = pages.reduce(
    (n, p) => n + (p.nodeReporting?.examplesShown ?? 0),
    0,
  );

  const evidenceDetail =
    evidenceReasons.join(" ") ||
    (evidenceReporting === "limited"
      ? `${retained} evidence example(s) retained from ${totalOcc} affected occurrence(s).`
      : "Full per-rule evidence within reporting limits.");

  const execDetail =
    executionReasons.length > 0
      ? executionReasons.join(" ")
      : `${pagesScanned} of ${Math.max(urlsSelected, pagesScanned)} selected page(s) scanned successfully.`;

  const autoDetail =
    model.summary.needsManualConfirmation > 0
      ? `${model.summary.needsManualConfirmation} rule condition(s) require manual confirmation.`
      : "No axe incomplete checks on scanned pages.";

  const humanDetail =
    model.summary.humanReviewTasks > 0
      ? `${model.summary.humanReviewTasks} relevant manual check(s) remain open.`
      : "Dedicated manual review checklist available.";

  return [
    {
      id: "page_execution",
      label: "Page execution",
      statusLabel: formatPageExecutionLabel(pageExecution),
      detail: execDetail,
    },
    {
      id: "evidence_retention",
      label: "Evidence retention",
      statusLabel: formatEvidenceReportingLabel(evidenceReporting),
      detail: evidenceDetail,
    },
    {
      id: "automated_determination",
      label: "Automated determination",
      statusLabel:
        model.summary.needsManualConfirmation > 0 ? "Needs review" : "Complete",
      detail: autoDetail,
    },
    {
      id: "human_review",
      label: "Human review",
      statusLabel: model.summary.humanReviewTasks > 0 ? "Open" : "Available",
      detail: humanDetail,
    },
  ];
}

function buildRuleRollups(model: ScanResultModel): RuleViewportOccurrences[] {
  const map = new Map<string, RuleViewportOccurrences>();

  for (const entry of model.ledger) {
    if (entry.filteringReason) continue;
    let row = map.get(entry.ruleId);
    if (!row) {
      row = {
        ruleId: entry.ruleId,
        uniqueAutomatedRule: false,
        desktopOccurrences: 0,
        mobileOccurrences: 0,
        totalOccurrences: 0,
        pagesFailed: [],
        pagesPassed: [],
        pagesIncomplete: [],
        pagesNotApplicable: [],
      };
      map.set(entry.ruleId, row);
    }
    const pageKey = `${entry.pageUrl}::${entry.viewportId}`;
    if (entry.axeBucket === "violation" && !entry.isBestPractice) {
      row.uniqueAutomatedRule = true;
      row.totalOccurrences += entry.occurrenceCount;
      if (entry.viewportId === "mobile") {
        row.mobileOccurrences += entry.occurrenceCount;
      } else {
        row.desktopOccurrences += entry.occurrenceCount;
      }
      if (!row.pagesFailed.includes(entry.pageUrl)) {
        row.pagesFailed.push(entry.pageUrl);
      }
    } else if (entry.axeBucket === "pass") {
      if (!row.pagesPassed.some((p) => p === entry.pageUrl)) {
        row.pagesPassed.push(entry.pageUrl);
      }
    } else if (entry.axeBucket === "incomplete") {
      if (!row.pagesIncomplete.includes(entry.pageUrl)) {
        row.pagesIncomplete.push(entry.pageUrl);
      }
    } else if (entry.axeBucket === "inapplicable") {
      if (!row.pagesNotApplicable.includes(entry.pageUrl)) {
        row.pagesNotApplicable.push(entry.pageUrl);
      }
    }
    void pageKey;
  }

  return [...map.values()].filter((r) => r.uniqueAutomatedRule || r.pagesIncomplete.length > 0);
}

function buildPageHotspots(pages: WebsitePageScanResult[]): PageHotspotRow[] {
  const rows: PageHotspotRow[] = [];
  for (const page of pages) {
    const key = `${page.finalUrl}::${page.viewport.id}`;
    const fails = page.violations.filter((v) => !v.isBestPractice);
    const occurrences = fails.reduce((n, v) => n + v.totalNodeCount, 0);
    const serious = fails.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    ).length;
    const needsConfirmation = page.incomplete.length;
    const diagnostic = buildPageScanDiagnostic(page);
    const completenessLabel = `Execution: ${formatPageExecutionLabel(diagnostic.pageExecution)} · Evidence: ${formatEvidenceReportingLabel(diagnostic.evidenceReporting)}`;
    rows.push({
      pageUrl: page.finalUrl,
      failedRules: fails.length,
      affectedOccurrences: occurrences,
      seriousCriticalRules: serious,
      needsConfirmation,
      completenessLabel,
    });
    void key;
  }
  return rows.sort(
    (a, b) =>
      b.seriousCriticalRules - a.seriousCriticalRules ||
      b.failedRules - a.failedRules ||
      b.affectedOccurrences - a.affectedOccurrences,
  );
}

function buildTopPriorities(
  intel: Pick<
    SiteScanIntelligence,
    "fixPlan" | "rootCauseGroups" | "normalizedFindings" | "scanResultModel"
  >,
): TopRemediationPriority[] {
  const items = getStartHereItems(intel.fixPlan, 5);
  const out: TopRemediationPriority[] = [];

  for (const item of items) {
    const group = intel.rootCauseGroups.find(
      (g) => g.id === item.rootCauseGroupId,
    );
    const finding = intel.normalizedFindings.find(
      (f) =>
        f.ruleId === item.ruleId &&
        f.status === "issue" &&
        (f.rootCauseGroupId === item.rootCauseGroupId || !item.rootCauseGroupId),
    );
    const criteria =
      finding?.wcagCriteria ??
      intel.normalizedFindings.find((f) => f.ruleId === item.ruleId)?.wcagCriteria ??
      [];
    const primary = criteria[0] ?? null;
    const level =
      finding?.wcagLevel ??
      (group
        ? intel.normalizedFindings.find((f) => f.ruleId === group.ruleId)?.wcagLevel
        : null);

    const incompleteOnly =
      !finding &&
      intel.normalizedFindings.some(
        (f) => f.ruleId === item.ruleId && f.status === "review",
      );

    let badge: TopRemediationPriority["sourceBadge"] = "Automated";
    if (finding?.bestPractice || item.title.toLowerCase().includes("best practice")) {
      badge = "Best practice";
    } else if (incompleteOnly) badge = "Needs confirmation";

    const retainedNote = group
      ? formatRetainedEvidenceNote(
          group.retainedEvidenceCount,
          group.totalOccurrences,
        )
      : null;

    out.push({
      id: item.rootCauseGroupId ?? item.ruleId ?? `rank-${item.rank}`,
      rank: item.rank,
      title: item.title,
      impact: item.impact,
      priority: item.priority,
      sourceBadge: badge,
      primaryWcagCriterion: primary,
      additionalWcagCount: Math.max(0, criteria.length - 1),
      wcagLevel: level ?? null,
      totalOccurrences: item.affectedElements,
      pagesAffected: item.affectedPages,
      retainedEvidenceSummary: retainedNote,
      whyItMatters: getUserImpactForRule(
        item.ruleId ?? "",
        item.title,
      ),
      ruleId: item.ruleId,
      rootCauseGroupId: item.rootCauseGroupId,
    });
  }
  return out;
}

export function buildExecutivePreflight(input: {
  pages: WebsitePageScanResult[];
  scanResultModel: ScanResultModel;
  intel: SiteScanIntelligence;
  urlsSelected: number;
}): SiteExecutivePreflight {
  const { pages, scanResultModel: model, intel, urlsSelected } = input;
  const s = model.summary;
  const pageExecution = aggregatePageExecution(pages);
  const evidenceReporting = aggregateEvidenceReporting(pages);

  const snapshot: ExecutiveSnapshot = {
    failedAutomatedRules: s.failedAutomatedRules,
    affectedOccurrences: s.affectedOccurrences,
    pagesScanned: pages.length,
    needsManualConfirmation: s.needsManualConfirmation,
    humanReviewOpen: s.humanReviewTasks,
    coverageStatusLabel: coverageStatusLabel(pageExecution, evidenceReporting),
    bestPracticeObservations: s.bestPracticeObservations,
    passedAutomatedRules: s.passedAutomatedRules,
    preflightStatusPhrase: preflightStatusPhrase(
      s.failedAutomatedRules,
      s.needsManualConfirmation,
    ),
  };

  const sharedRootCauseCount =
    intel.summary.sharedRootCauses ?? intel.summary.likelyRootCauses ?? 0;

  return {
    snapshot,
    categorySummary: buildCategorySummary(model),
    coverageDiagnostic: buildCoverageDiagnostic(
      pages,
      model,
      pages.length,
      urlsSelected,
    ),
    topRemediationPriorities: buildTopPriorities(intel),
    pageHotspots: buildPageHotspots(pages),
    ruleRollups: buildRuleRollups(model),
    sharedRootCauseCount,
  };
}
