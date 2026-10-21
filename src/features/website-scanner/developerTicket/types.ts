import type { AccessibilityEvidenceSource } from "@/features/accessibility-intelligence/types/evidence";
import type { RemediationPriority } from "@/features/accessibility-intelligence/types/normalizedFinding";
import type { AxeImpact } from "@/features/website-scanner/types/scanTypes";

export type DeveloperTicketFormat = "markdown" | "plain";

export type DeveloperTicketEvidence = {
  pagePath: string;
  selector?: string;
  htmlSnippet?: string;
  failureSummary?: string;
};

export type DeveloperTicketScanContext = {
  scannedOrigin?: string;
  viewportLabel: string;
  scanCompletedAt?: string;
  scanCompletenessNote?: string;
  axeVersion?: string;
  verificationStatus?: string;
  verificationOccurrenceDelta?: string;
  visualLocatorNote?: string;
};

export type DeveloperTicket = {
  version: string;
  title: string;
  summary: string;
  priority: RemediationPriority;
  impact: AxeImpact;
  sourceType: AccessibilityEvidenceSource;
  ruleId?: string;
  wcagCriteria: string[];
  wcagLevel?: string | null;
  standardClassification?: "wcag" | "best_practice" | "human_review";
  userImpact: string;
  rootCause?: {
    label: string;
    confidence?: "high" | "medium" | "low";
    likelySharedComponent: boolean;
    confidenceNote?: string;
  };
  scope: {
    affectedPageCount: number;
    affectedElementCount: number;
    affectedPagePaths: string[];
    additionalPageCount: number;
    selectorsShown: number;
    totalSelectorsAvailable: number;
    retainedEvidenceCount?: number;
  };
  representativeEvidence: DeveloperTicketEvidence[];
  recommendedFix: string[];
  possibleImplementationPattern?: string;
  acceptanceCriteria: string[];
  verificationSteps: string[];
  manualReviewRequired: boolean;
  limitations: string[];
  scanContext?: DeveloperTicketScanContext;
  aiAssistedGuidance?: {
    plainLanguageExplanation: string;
    suggestedFixes: string[];
    developerExample?: string | null;
    disclaimer: string;
  };
};

export type BuildDeveloperTicketInput = {
  ruleId: string;
  axeHelp: string;
  impact: AxeImpact;
  priority: RemediationPriority;
  bestPractice?: boolean;
  humanReviewRequired?: boolean;
  sourceType: AccessibilityEvidenceSource;
  wcagCriteria?: string[];
  wcagLevel?: "A" | "AA" | "AAA" | null;
  rootCause?: {
    label: string;
    confidence: "high" | "medium" | "low";
    likelySharedComponent: boolean;
    affectedPages: string[];
    totalOccurrences: number;
    retainedEvidenceCount?: number;
    representativeSelectors: string[];
    representativeEvidence: {
      selector?: string;
      htmlSnippet?: string;
      failureSummary?: string;
      pageUrl?: string;
    }[];
  };
  findingFallback?: {
    title: string;
    description: string;
    pageUrl?: string;
    occurrenceCount?: number;
    evidence: {
      selector?: string;
      htmlSnippet?: string;
      failureSummary?: string;
    }[];
  };
  scanContext: DeveloperTicketScanContext;
  viewportDetail?: string;
  aiGuidance?: {
    plainLanguageExplanation: string;
    suggestedFixes: string[];
    developerExample?: string | null;
  };
};
