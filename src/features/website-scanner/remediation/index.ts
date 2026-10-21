export type {
  DeterministicRemediationDefinition,
  RemediationAction,
  RemediationVerificationStep,
  SupportedFramework,
} from "@/features/website-scanner/remediation/types";
export { REMEDIATION_LIBRARY_VERSION } from "@/features/website-scanner/remediation/types";
export { getRemediationLibraryVersion } from "@/features/website-scanner/remediation/registry";
export {
  buildDeterministicGuidanceStrings,
  getDeterministicRemediation,
  hasFullDeterministicRemediation,
  listSupportedDeterministicRuleIds,
} from "@/features/website-scanner/remediation/registry";
export { buildEvidenceAwareNotes } from "@/features/website-scanner/remediation/evidenceAwareNotes";
export { remediationActionsForRule } from "@/features/website-scanner/remediation/remediationActionRouter";
export { toRuleKnowledge } from "@/features/website-scanner/remediation/adaptRuleKnowledge";
export { isClientAiRemediationAvailable } from "@/features/website-scanner/remediation/clientAiRemediation";
