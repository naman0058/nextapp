import type { AccessibilityRuleLevel, AxeImpact } from "@/features/website-scanner/types/scanTypes";

/** Where a result originated. */
export type ScanResultSource =
  | "AXE_WCAG"
  | "AXE_BEST_PRACTICE"
  | "DETERMINISTIC"
  | "MANUAL";

/** Axe engine bucket (mutually exclusive per page evaluation). */
export type AxeEngineBucket = "violation" | "incomplete" | "pass" | "inapplicable";

/** Canonical user-facing outcome (never overload axe incomplete as FAIL). */
export type ScanResultOutcome =
  | "FAIL"
  | "PASS"
  | "INCOMPLETE"
  | "NOT_APPLICABLE"
  | "REVIEW_REQUIRED";

/** Stable product grouping (one primary category per rule). */
export type ProductFindingCategory =
  | "Visual & Contrast"
  | "Images & Alternatives"
  | "Structure & Landmarks"
  | "Names, Roles & ARIA"
  | "Navigation & Links"
  | "Keyboard & Focus"
  | "Forms & Input"
  | "Media"
  | "Language & Metadata"
  | "Tables & Lists"
  | "Dynamic Content"
  | "Best Practices";

export type AxeEvaluatedRuleRecord = {
  ruleId: string;
  axeBucket: AxeEngineBucket;
  nodeCount: number;
  help: string;
  description?: string;
  tags: string[];
  impact: AxeImpact | null;
  isBestPractice: boolean;
  /** Best-practice violation omitted from normalized violations when toggle off. */
  excludedFromViolations?: boolean;
};

export type CoverageLedgerEntry = {
  id: string;
  ruleId: string;
  title: string;
  pageUrl: string;
  viewportId: string;
  source: ScanResultSource;
  outcome: ScanResultOutcome;
  axeBucket: AxeEngineBucket;
  productCategory: ProductFindingCategory;
  wcagCriteria: string[];
  wcagLevel: AccessibilityRuleLevel;
  tags: string[];
  impact: AxeImpact | null;
  nodeCount: number;
  occurrenceCount: number;
  isBestPractice: boolean;
  alsoHasAutomatedFailure: boolean;
  includedInUserReport: boolean;
  filteringReason?: string;
};

export type ScanResultSummaryCounters = {
  automatedRulesEvaluated: number;
  failedAutomatedRules: number;
  affectedOccurrences: number;
  passedAutomatedRules: number;
  needsManualConfirmation: number;
  notApplicableRules: number;
  bestPracticeObservations: number;
  humanReviewTasks: number;
  /** Incomplete evaluations that overlap a WCAG failure on the same page/viewport. */
  incompleteOverlappingFailure: number;
};

export type ScanResultModel = {
  generatedAt: string;
  includeBestPractices: boolean;
  summary: ScanResultSummaryCounters;
  ledger: CoverageLedgerEntry[];
  passedChecks: CoverageLedgerEntry[];
  notApplicableChecks: CoverageLedgerEntry[];
  incompleteChecks: CoverageLedgerEntry[];
  failedChecks: CoverageLedgerEntry[];
  bestPracticeChecks: CoverageLedgerEntry[];
};
