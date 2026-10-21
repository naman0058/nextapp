import type { RemediationPriority } from "@/features/accessibility-intelligence/types/normalizedFinding";
import type { AxeImpact } from "@/features/website-scanner/types/scanTypes";
import type { ProductFindingCategory } from "@/features/website-scanner/taxonomy/types";

export type ExecutiveSnapshot = {
  failedAutomatedRules: number;
  affectedOccurrences: number;
  pagesScanned: number;
  needsManualConfirmation: number;
  humanReviewOpen: number;
  coverageStatusLabel: string;
  bestPracticeObservations: number;
  passedAutomatedRules: number;
  preflightStatusPhrase: string;
};

export type CategoryAreaSummary = {
  category: ProductFindingCategory;
  failedRuleCount: number;
  affectedOccurrences: number;
  confirmationNeededCount: number;
  pagesAffected: number;
};

export type CoverageDiagnosticRow = {
  id: "page_execution" | "evidence_retention" | "automated_determination" | "human_review";
  label: string;
  statusLabel: string;
  detail: string;
};

export type RuleViewportOccurrences = {
  ruleId: string;
  uniqueAutomatedRule: boolean;
  desktopOccurrences: number;
  mobileOccurrences: number;
  totalOccurrences: number;
  pagesFailed: string[];
  pagesPassed: string[];
  pagesIncomplete: string[];
  pagesNotApplicable: string[];
};

export type TopRemediationPriority = {
  id: string;
  rank: number;
  title: string;
  impact: AxeImpact;
  priority: RemediationPriority;
  sourceBadge: "Automated" | "Best practice" | "Needs confirmation" | "Deterministic";
  primaryWcagCriterion: string | null;
  additionalWcagCount: number;
  wcagLevel: string | null;
  totalOccurrences: number;
  pagesAffected: number;
  retainedEvidenceSummary: string | null;
  whyItMatters: string;
  ruleId?: string;
  rootCauseGroupId?: string;
};

export type PageHotspotRow = {
  pageUrl: string;
  failedRules: number;
  affectedOccurrences: number;
  seriousCriticalRules: number;
  needsConfirmation: number;
  completenessLabel: string;
};

export type SiteExecutivePreflight = {
  snapshot: ExecutiveSnapshot;
  categorySummary: CategoryAreaSummary[];
  coverageDiagnostic: CoverageDiagnosticRow[];
  topRemediationPriorities: TopRemediationPriority[];
  pageHotspots: PageHotspotRow[];
  ruleRollups: RuleViewportOccurrences[];
  sharedRootCauseCount: number;
};
