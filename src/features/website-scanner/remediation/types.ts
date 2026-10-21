export const REMEDIATION_LIBRARY_VERSION = 1;

export type VerificationKind = "automated" | "manual" | "both";

export type SupportedFramework = "html" | "react" | "vue" | "angular";

export type RemediationVerificationStep = {
  text: string;
  kind: VerificationKind;
};

export type SpecializedToolRef = {
  id: string;
  href: string;
  label: string;
};

export type WcagMappingRef = {
  criterion: string;
  level: "A" | "AA" | "AAA" | string;
  note?: string;
};

export type DeterministicRemediationDefinition = {
  ruleId: string;
  definitionVersion: number;
  title: string;
  shortProblem: string;
  whyItMatters: string;
  wcagMappings: WcagMappingRef[];
  /** True when axe tags indicate best-practice rather than WCAG failure. */
  isBestPracticeRule?: boolean;
  /** Human must decide semantics (e.g. alt meaning). */
  requiresHumanJudgment?: boolean;
  supportedFrameworks: SupportedFramework[];
  remediationSteps: string[];
  whyThisWorks?: string;
  examples?: Partial<Record<SupportedFramework, string>>;
  verificationSteps: RemediationVerificationStep[];
  specializedTool?: SpecializedToolRef;
  implementationNotes?: string[];
  limitations?: string[];
  relatedManualReviewIds?: string[];
  developerAcceptanceCriteria: string[];
  sourceReferences?: { label: string; url?: string }[];
};

export type RemediationActionKind =
  | "specialized_tool"
  | "visual_locator"
  | "developer_ticket"
  | "platform_guidance";

export type RemediationAction = {
  kind: RemediationActionKind;
  href?: string;
  label: string;
  description?: string;
};
