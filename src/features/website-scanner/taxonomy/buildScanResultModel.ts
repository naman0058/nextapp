import {
  deriveRuleLevel,
  extractWcagCriteria,
} from "@/features/website-scanner/server/axe/wcagFromTags";
import {
  includedInUserReport,
  outcomeFromAxeBucket,
  sourceForRule,
} from "@/features/website-scanner/taxonomy/outcomeMapping";
import { primaryCategoryForRule } from "@/features/website-scanner/taxonomy/ruleCategoryMap";
import type {
  AxeEvaluatedRuleRecord,
  CoverageLedgerEntry,
  ScanResultModel,
  ScanResultSummaryCounters,
} from "@/features/website-scanner/taxonomy/types";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

function recordsForPage(page: WebsitePageScanResult): AxeEvaluatedRuleRecord[] {
  if (page.axeEvaluatedRules?.length) return page.axeEvaluatedRules;
  const out: AxeEvaluatedRuleRecord[] = [];
  for (const v of page.violations) {
    out.push({
      ruleId: v.id,
      axeBucket: "violation",
      nodeCount: v.totalNodeCount,
      help: v.help,
      description: v.description,
      tags: v.tags,
      impact: v.impact,
      isBestPractice: v.isBestPractice,
    });
  }
  for (const inc of page.incomplete) {
    out.push({
      ruleId: inc.id,
      axeBucket: "incomplete",
      nodeCount: inc.totalNodeCount,
      help: inc.help,
      description: inc.description,
      tags: inc.tags,
      impact: inc.impact,
      isBestPractice: inc.tags.includes("best-practice"),
    });
  }
  return out;
}

function wcagFailureRuleIdsOnPage(page: WebsitePageScanResult): Set<string> {
  return new Set(
    page.violations.filter((v) => !v.isBestPractice).map((v) => v.id),
  );
}

export function buildScanResultModel(
  pages: WebsitePageScanResult[],
  options: {
    includeBestPractices: boolean;
    humanReviewTasks: number;
    generatedAt?: string;
  },
): ScanResultModel {
  const ledger: CoverageLedgerEntry[] = [];
  const failedWcagRuleIds = new Set<string>();
  const bestPracticeFailIds = new Set<string>();
  let affectedOccurrences = 0;

  for (const page of pages) {
    const wcagFails = wcagFailureRuleIdsOnPage(page);
    for (const rec of recordsForPage(page)) {
      const wcagCriteria = extractWcagCriteria(rec.tags);
      const wcagLevel = deriveRuleLevel(rec.tags);
      const source = sourceForRule(rec.isBestPractice);
      const alsoHasAutomatedFailure =
        rec.axeBucket === "incomplete" && wcagFails.has(rec.ruleId);
      const outcome = outcomeFromAxeBucket(rec.axeBucket, {
        isBestPractice: rec.isBestPractice,
        excludedFromViolations: rec.excludedFromViolations,
        hasWcagFailureOnSamePage: wcagFails.has(rec.ruleId),
      });
      const filteringReason = rec.excludedFromViolations
        ? "Best-practice rule not included (includeBestPractices=false)."
        : undefined;
      let included = includedInUserReport(outcome);
      if (rec.excludedFromViolations) {
        included = false;
      }
      if (rec.axeBucket === "violation" && rec.isBestPractice) {
        bestPracticeFailIds.add(rec.ruleId);
      }
      if (
        rec.axeBucket === "violation" &&
        !rec.isBestPractice &&
        !rec.excludedFromViolations
      ) {
        failedWcagRuleIds.add(rec.ruleId);
        affectedOccurrences += rec.nodeCount;
      }

      ledger.push({
        id: `${page.finalUrl}::${page.viewport.id}::${rec.ruleId}::${rec.axeBucket}`,
        ruleId: rec.ruleId,
        title: rec.help,
        pageUrl: page.finalUrl,
        viewportId: page.viewport.id,
        source,
        outcome,
        axeBucket: rec.axeBucket,
        productCategory: primaryCategoryForRule(rec.ruleId, rec.isBestPractice),
        wcagCriteria,
        wcagLevel,
        tags: rec.tags,
        impact: rec.impact,
        nodeCount: rec.nodeCount,
        occurrenceCount: rec.nodeCount,
        isBestPractice: rec.isBestPractice,
        alsoHasAutomatedFailure,
        includedInUserReport: included,
        filteringReason,
      });
    }
  }

  const evaluatedRuleIds = new Set(ledger.map((e) => e.ruleId));
  const incompleteEntries = ledger.filter((e) => e.outcome === "INCOMPLETE");
  const incompleteOverlappingFailure = incompleteEntries.filter(
    (e) => e.alsoHasAutomatedFailure,
  ).length;

  const passOnlyRuleIds = new Set<string>();
  const naOnlyRuleIds = new Set<string>();
  for (const ruleId of evaluatedRuleIds) {
    const entries = ledger.filter((e) => e.ruleId === ruleId);
    const hasWcagFail = entries.some(
      (e) =>
        e.axeBucket === "violation" &&
        !e.isBestPractice &&
        !e.filteringReason,
    );
    const hasIncomplete = entries.some((e) => e.axeBucket === "incomplete");
    const hasPass = entries.some((e) => e.axeBucket === "pass");
    const hasNa = entries.some((e) => e.axeBucket === "inapplicable");
    if (!hasWcagFail && hasPass) passOnlyRuleIds.add(ruleId);
    if (!hasWcagFail && !hasIncomplete && hasNa) naOnlyRuleIds.add(ruleId);
  }

  const summary: ScanResultSummaryCounters = {
    automatedRulesEvaluated: evaluatedRuleIds.size,
    failedAutomatedRules: failedWcagRuleIds.size,
    affectedOccurrences,
    passedAutomatedRules: passOnlyRuleIds.size,
    needsManualConfirmation: incompleteEntries.length,
    notApplicableRules: naOnlyRuleIds.size,
    bestPracticeObservations: bestPracticeFailIds.size,
    humanReviewTasks: options.humanReviewTasks,
    incompleteOverlappingFailure,
  };

  const failedChecks = ledger.filter(
    (e) =>
      e.axeBucket === "violation" &&
      !e.isBestPractice &&
      !e.filteringReason,
  );
  const bestPracticeChecks = ledger.filter(
    (e) => e.axeBucket === "violation" && e.isBestPractice && !e.filteringReason,
  );
  const passedChecks = ledger.filter((e) => e.outcome === "PASS");
  const notApplicableChecks = ledger.filter((e) => e.outcome === "NOT_APPLICABLE");
  const incompleteChecks = incompleteEntries;

  return {
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    includeBestPractices: options.includeBestPractices,
    summary,
    ledger,
    passedChecks,
    notApplicableChecks,
    incompleteChecks,
    failedChecks,
    bestPracticeChecks,
  };
}

export function scanResultCounters(model: ScanResultModel | null | undefined) {
  return (
    model?.summary ?? {
      automatedRulesEvaluated: 0,
      failedAutomatedRules: 0,
      affectedOccurrences: 0,
      passedAutomatedRules: 0,
      needsManualConfirmation: 0,
      notApplicableRules: 0,
      bestPracticeObservations: 0,
      humanReviewTasks: 0,
      incompleteOverlappingFailure: 0,
    }
  );
}
