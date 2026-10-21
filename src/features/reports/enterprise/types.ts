import type { ReportContribution } from "@/features/accessibility-workspace/types";
import type { HumanReviewReportBlock } from "@/features/human-review-workspace/types";
import type { SiteExecutivePreflight } from "@/features/website-scanner/executive/types";
import type { ScanResultSummaryCounters } from "@/features/website-scanner/taxonomy/types";
import type { FindingDetail } from "@/features/website-scanner/findingDetail/types";

export type EnterpriseReportMeta = {
  reportId: string;
  reportSchemaVersion: string;
  generatedAt: string;
  generatedAtDisplay: string;
  reportVersion: string;
  remediationLibraryVersion: number;
  humanReviewRegistryVersion: number;
  axeVersion: string | null;
  scannerVersion: string | null;
};

export type EnterpriseScope = {
  targetUrl: string;
  scanMode: string;
  viewportMode: string;
  pagesSelected: number;
  pagesScanned: number;
  scanSource: string;
  executionStatusLabel: string;
  partialScanNote: string | null;
};

export type EnterpriseExecutiveSummary = {
  statusPhrase: string;
  shortNote: string;
  zeroFindingNote: string | null;
  snapshot: SiteExecutivePreflight["snapshot"];
};

export type EnterpriseEvidenceRow = {
  evidenceId: string;
  pageUrl: string;
  viewportId: string;
  selector: string | null;
  failureSummary: string | null;
  sanitizedHtml: string | null;
};

export type EnterpriseAutomatedFinding = {
  findingId: string;
  ruleId: string;
  title: string;
  category: string;
  impact: string;
  priority: string;
  sourceBadge: string;
  kind: FindingDetail["kind"];
  wcagMappings: FindingDetail["wcagMappings"];
  totalOccurrences: number;
  retainedEvidenceCount: number;
  pdfMainEvidenceLimit: number;
  pdfShownCount: number;
  pagesAffected: number;
  affectedUrls: string[];
  affectedViewports: string[];
  pageViewportBreakdown: FindingDetail["pageViewportScopes"];
  problem: string;
  whyItMatters: string;
  representativeEvidence: EnterpriseEvidenceRow[];
  remediationDefinitionId: string | null;
  remediationDefinitionVersion: number | null;
  recommendedAction: string | null;
  verificationSteps: string[];
};

export type EnterpriseIncompleteRow = {
  ruleId: string;
  title: string;
  description: string;
  relatedHumanReviewCheckIds: string[];
  overlapsFailure: boolean;
};

export type EnterpriseBestPracticeRow = {
  ruleId: string;
  title: string;
  totalOccurrences: number;
  pagesAffected: number;
};

export type EnterprisePageInventoryRow = {
  url: string;
  title: string;
  viewportLabel: string;
  executionLabel: string;
  failedRules: number;
  occurrences: number;
  needsConfirmation: number;
};

export type EnterpriseVerificationRow = {
  ruleId: string;
  pageUrl: string;
  selector: string;
  statusLabel: string;
  detail: string;
};

export type EnterpriseRemediationPlanItem = {
  remediationGroupId: string;
  findingId: string;
  ruleId: string;
  definitionId: string | null;
  definitionVersion: number | null;
  title: string;
  summary: string;
  whyItWorks: string | null;
  implementationSteps: string[];
  selectedFramework: import("@/features/website-scanner/remediation/types").SupportedFramework | null;
  codeExample: string | null;
  verificationSteps: string[];
  specializedTool: { id: string; label: string; href: string } | null;
  manualReviewStillRequired: boolean;
  hasFullDeterministicGuidance: boolean;
};

export type EnterpriseExportSelection = {
  coreScannerIncluded: true;
  humanReviewIncluded: true;
  contributionsIncludedCount: number;
  aiRemediationIncluded: boolean;
  developerGuidanceIncluded: boolean;
  visualEvidenceIncluded: boolean;
};

export type EnterprisePreflightReport = {
  reportMeta: EnterpriseReportMeta;
  scope: EnterpriseScope;
  executiveSummary: EnterpriseExecutiveSummary;
  coverage: SiteExecutivePreflight["coverageDiagnostic"];
  affectedAreas: SiteExecutivePreflight["categorySummary"];
  priorities: SiteExecutivePreflight["topRemediationPriorities"];
  taxonomy: ScanResultSummaryCounters;
  automatedFindings: EnterpriseAutomatedFinding[];
  remediationPlan: EnterpriseRemediationPlanItem[];
  incompleteFindings: EnterpriseIncompleteRow[];
  bestPracticeFindings: EnterpriseBestPracticeRow[];
  humanReview: HumanReviewReportBlock;
  additionalEvidence: ReportContribution[];
  pageInventory: EnterprisePageInventoryRow[];
  verification: EnterpriseVerificationRow[];
  methodology: { version: string; sections: { title: string; bullets: string[] }[] };
  disclaimer: string;
  exportSelection: EnterpriseExportSelection;
  counters: {
    failedAutomatedRules: number;
    affectedOccurrences: number;
    needsManualConfirmation: number;
    humanReviewReviewed: number;
    humanReviewRelevant: number;
    humanReviewRemainingOpen: number;
    pagesScanned: number;
    passedAutomatedRules: number;
  };
};
