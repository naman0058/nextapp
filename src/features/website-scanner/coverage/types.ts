import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";
import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

/** Raw axe result bucket for one rule id on a page. */
export type RawAxeRuleBucket = "violations" | "incomplete" | "passes" | "inapplicable";

export type RawAxeRuleInventoryItem = {
  ruleId: string;
  bucket: RawAxeRuleBucket;
  nodeCount: number;
  impact: string | null;
  tags: string[];
  isBestPractice: boolean;
};

export type AxeRuleDispositionReason =
  | "preserved_automated_violation"
  | "preserved_automated_incomplete"
  | "preserved_automated_pass"
  | "preserved_automated_inapplicable"
  | "filtered_best_practice_disabled"
  | "evidence_nodes_truncated"
  | "lost_not_in_normalized"
  | "in_report_automated"
  | "in_report_manual_review"
  | "not_applicable_to_product_surface";

export type AxeRuleLedgerEntry = {
  ruleId: string;
  rawBucket: RawAxeRuleBucket;
  rawNodeCount: number;
  disposition: AxeRuleDispositionReason;
  detail?: string;
  inNormalizedViolations: boolean;
  inNormalizedIncomplete: boolean;
  inRemediationGroups: boolean;
  inNormalizedFindingsIssue: boolean;
  inNormalizedFindingsReview: boolean;
  inReportFindings: boolean;
  retainedEvidenceNodes: number;
  scannerTotalNodeCount: number;
};

export type PageScanCoverageAudit = {
  pageUrl: string;
  includeBestPractices: boolean;
  axeRunTags: string[];
  rawCounts: {
    violations: number;
    incomplete: number;
    passes: number;
    inapplicable: number;
  };
  rawInventory: RawAxeRuleInventoryItem[];
  ruleLedger: AxeRuleLedgerEntry[];
  undocumentedLosses: string[];
};

export type ProductCoverageTrace = {
  pages: PageScanCoverageAudit[];
  intelligence: {
    uniqueAutomatedRules: number;
    uniqueRuleIds: string[];
    remediationGroupRuleIds: string[];
    normalizedIssueRuleIds: string[];
    normalizedReviewRuleIds: string[];
  };
  report: {
    automatedAttentionRuleIds: string[];
    manualReviewRuleIds: string[];
  };
};

export type BuildPageCoverageAuditInput = {
  pageUrl: string;
  includeBestPractices: boolean;
  axeRunTags: string[];
  rawInventory: RawAxeRuleInventoryItem[];
  page: Pick<
    WebsitePageScanResult,
    "violations" | "incomplete" | "passesCount" | "inapplicableCount"
  >;
  rootCauseRuleIds: Set<string>;
  normalizedIssueRuleIds: Set<string>;
  normalizedReviewRuleIds: Set<string>;
  reportFindingRuleIds: Set<string>;
};

export type BuildProductTraceInput = {
  pages: WebsitePageScanResult[];
  includeBestPractices: boolean;
  axeRunTags: string[];
  rawInventories: RawAxeRuleInventoryItem[][];
  intelligence: SiteScanIntelligence;
  report?: AccessibilityPreflightReport;
};
