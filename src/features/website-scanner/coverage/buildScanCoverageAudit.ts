import type {
  AxeRuleDispositionReason,
  AxeRuleLedgerEntry,
  BuildPageCoverageAuditInput,
  PageScanCoverageAudit,
} from "@/features/website-scanner/coverage/types";
import { countRawAxeBuckets } from "@/features/website-scanner/coverage/summarizeRawAxeResults";

function dispositionForRawItem(
  input: BuildPageCoverageAuditInput,
  item: BuildPageCoverageAuditInput["rawInventory"][0],
): { disposition: AxeRuleDispositionReason; detail?: string } {
  const normV = input.page.violations.find((v) => v.id === item.ruleId);
  const normI = input.page.incomplete.find((i) => i.id === item.ruleId);

  if (item.bucket === "passes") {
    return {
      disposition: "preserved_automated_pass",
      detail: "Not shown as a failure (axe pass).",
    };
  }
  if (item.bucket === "inapplicable") {
    return {
      disposition: "preserved_automated_inapplicable",
      detail: "Not shown as a failure (axe inapplicable).",
    };
  }

  if (item.bucket === "incomplete") {
    if (normI) {
      return {
        disposition: "preserved_automated_incomplete",
        detail: "Surfaced as manual confirmation / review finding.",
      };
    }
    return {
      disposition: "lost_not_in_normalized",
      detail: "Raw incomplete missing from normalized incomplete.",
    };
  }

  if (item.isBestPractice && !input.includeBestPractices) {
    return {
      disposition: "filtered_best_practice_disabled",
      detail: DOCUMENTED_FILTER_DETAIL,
    };
  }

  if (!normV) {
    return {
      disposition: "lost_not_in_normalized",
      detail: "Raw violation missing from normalized violations.",
    };
  }

  let detail: string | undefined;
  if (normV.totalNodeCount > normV.nodes.length) {
    detail = `Evidence cap: ${normV.nodes.length} retained example(s) of ${normV.totalNodeCount} occurrence(s).`;
  }
  return { disposition: "preserved_automated_violation", detail };
}

const DOCUMENTED_FILTER_DETAIL =
  "includeBestPractices=false; see DOCUMENTED_POST_AXE_FILTERS.bestPracticeViolationsWhenDisabled.";

function buildLedgerEntry(
  input: BuildPageCoverageAuditInput,
  item: BuildPageCoverageAuditInput["rawInventory"][0],
): AxeRuleLedgerEntry {
  const normV = input.page.violations.find((v) => v.id === item.ruleId);
  const normI = input.page.incomplete.find((i) => i.id === item.ruleId);
  const { disposition, detail } = dispositionForRawItem(input, item);

  const inReport =
    input.reportFindingRuleIds.has(item.ruleId) ||
    (item.bucket === "violations" &&
      !item.isBestPractice &&
      input.reportFindingRuleIds.has(item.ruleId));

  return {
    ruleId: item.ruleId,
    rawBucket: item.bucket,
    rawNodeCount: item.nodeCount,
    disposition,
    detail,
    inNormalizedViolations: Boolean(normV),
    inNormalizedIncomplete: Boolean(normI),
    inRemediationGroups: input.rootCauseRuleIds.has(item.ruleId),
    inNormalizedFindingsIssue: input.normalizedIssueRuleIds.has(item.ruleId),
    inNormalizedFindingsReview: input.normalizedReviewRuleIds.has(item.ruleId),
    inReportFindings: inReport,
    retainedEvidenceNodes: normV?.nodes.length ?? normI?.nodes.length ?? 0,
    scannerTotalNodeCount: normV?.totalNodeCount ?? normI?.totalNodeCount ?? 0,
  };
}

export function buildPageScanCoverageAudit(
  input: BuildPageCoverageAuditInput,
): PageScanCoverageAudit {
  const rawCounts = countRawAxeBuckets(input.rawInventory);
  const ruleLedger = input.rawInventory.map((item) => buildLedgerEntry(input, item));
  const undocumentedLosses = ruleLedger
    .filter((e) => e.disposition === "lost_not_in_normalized")
    .map((e) => `${e.ruleId} (${e.rawBucket})`);

  return {
    pageUrl: input.pageUrl,
    includeBestPractices: input.includeBestPractices,
    axeRunTags: input.axeRunTags,
    rawCounts,
    rawInventory: input.rawInventory,
    ruleLedger,
    undocumentedLosses,
  };
}
