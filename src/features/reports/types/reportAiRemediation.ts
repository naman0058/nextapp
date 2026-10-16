import type { AIRemediationReport, RemediationSource } from "@/lib/ai/remediation/types";

export type ReportAiRemediationInclusionStatus = "selected" | "excluded";

export type ReportAiRemediationFactBlock = {
  ruleId?: string;
  wcag?: string;
  impact?: string;
  priority?: string;
  pageReference?: string;
  itemReference?: string;
  occurrenceCount?: number;
  pageCount?: number;
  viewport?: string;
  originalContent?: string;
  suggestedDeterministicColor?: string;
  foregroundHex?: string;
  backgroundHex?: string;
  measuredRatio?: string;
  requiredThreshold?: string;
  contrastResult?: string;
  originalCue?: string;
  cueTimestamp?: string;
  batchRow?: number;
  batchField?: "caption" | "alt";
  imageAnalysisSource?: string;
  deterministicFinding?: string;
};

export type ReportAiRemediationEntry = {
  id: string;
  source: RemediationSource;
  sourceReference: string;
  title: string;
  generatedAt?: string;
  promptVersion?: string;
  schemaVersion?: string;
  framework?: string | null;
  remediation: AIRemediationReport;
  facts?: ReportAiRemediationFactBlock;
  inclusionStatus: ReportAiRemediationInclusionStatus;
  stale?: boolean;
  staleReason?: string | null;
  sampleLabel?: string;
};

export type ReportAiRemediationAppendix = {
  intro: string;
  entries: ReportAiRemediationEntry[];
  includedCount: number;
  sampleLabel?: string;
};

/** Catalog item before inclusion is applied at build time */
export type ReportAiRemediationCandidate = Omit<
  ReportAiRemediationEntry,
  "inclusionStatus"
> & {
  promptVersion?: string;
  schemaVersion?: string;
};

export const AI_REMEDIATION_APPENDIX_INTRO =
  "AI-assisted remediation suggestions are generated from selected issue evidence and should be reviewed and tested before implementation. They do not replace automated findings, human review, or verification.";
