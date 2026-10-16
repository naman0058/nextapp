import type { AiRemediationErrorCode } from "@/lib/ai/remediation/errors";

export type RemediationSource =
  | "website"
  | "social"
  | "image"
  | "contrast"
  | "video"
  | "batch";

export type CodeFramework =
  | "generic_html"
  | "react"
  | "vue"
  | "angular"
  | "unknown";

/** Factual inputs from deterministic product — preserved outside model output */
export type RemediationFacts = Record<string, unknown> & {
  issueFingerprint?: string;
  ruleId?: string;
  impact?: string;
};

export type RemediationPreferences = {
  framework?: CodeFramework;
  rewriteMode?: "accessibility_preserving";
};

export type SuggestedCodeBlock = {
  language: string;
  code: string;
  explanation: string;
};

export type RemediationAlternative = {
  label: string;
  explanation: string;
  code?: string | null;
  content?: string | null;
};

export type AIRemediationReport = {
  version: string;
  source: RemediationSource;
  title: string;
  problemSummary: string;
  whyItMatters: string;
  recommendedApproach: string[];
  suggestedCode?: SuggestedCodeBlock | null;
  suggestedContent?: string | null;
  alternatives: RemediationAlternative[];
  mistakesToAvoid: string[];
  acceptanceCriteria: string[];
  verificationSteps: string[];
  humanReview: string[];
  assumptions: string[];
  limitations: string[];
  confidenceNote?: string | null;
};

export type GenerateRemediationInput = {
  source: RemediationSource;
  facts: RemediationFacts;
  deterministicGuidance?: string[];
  preferences?: RemediationPreferences;
};

export type GenerateRemediationResult = {
  report: AIRemediationReport;
  promptVersion: string;
  schemaVersion: string;
  model: string;
  generatedAt: string;
  cached: boolean;
};

export type RemediationApiRequestBody = {
  source: RemediationSource;
  sessionId?: string;
  scanId?: string;
  facts: RemediationFacts;
  deterministicGuidance?: string[];
  frameworkPreference?: CodeFramework;
};

export type RemediationApiSuccessResponse = {
  report: AIRemediationReport;
  facts: RemediationFacts;
  promptVersion: string;
  schemaVersion: string;
  generatedAt: string;
  cached?: boolean;
};

export type RemediationApiErrorResponse = {
  error: string;
  code: AiRemediationErrorCode;
  retryAfterMs?: number;
};
