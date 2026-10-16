export type AccessibilityEvidenceSource =
  | "axe"
  | "deterministic_rule"
  | "measurement"
  | "ai_observation"
  | "human_review"
  | "platform_guidance";

export type ConfidenceCategory =
  | "deterministic"
  | "measured"
  | "tool_detected"
  | "ai_assisted"
  | "human_required";

export type AccessibilityEvidence = {
  sourceType: AccessibilityEvidenceSource;
  sourceId?: string;
  engine?: string;
  engineVersion?: string;
  wcagCriteria?: string[];
  evidenceText?: string;
  selector?: string;
  htmlSnippet?: string;
  measurement?: {
    name: string;
    value: number | string;
    threshold?: number | string;
    unit?: string;
  };
  confidenceCategory: ConfidenceCategory;
  limitations?: string[];
};
