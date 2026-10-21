export type {
  DeterministicFixTemplate,
  RuleKnowledge,
} from "@/features/accessibility-intelligence/knowledge/ruleKnowledgeTypes";
import {
  getDeterministicRemediation,
  toRuleKnowledge,
} from "@/features/website-scanner/remediation";

export function getRuleKnowledge(
  ruleId: string,
): import("@/features/accessibility-intelligence/knowledge/ruleKnowledgeTypes").RuleKnowledge | undefined {
  const def = getDeterministicRemediation(ruleId);
  if (!def) return undefined;
  return toRuleKnowledge(def);
}

export function getUserImpactForRule(
  ruleId: string,
  axeHelp: string,
): string {
  return getDeterministicRemediation(ruleId)?.whyItMatters ?? axeHelp;
}

export function getVerificationStepsForRule(ruleId: string): string[] {
  const def = getDeterministicRemediation(ruleId);
  if (!def) return [];
  return def.verificationSteps.map((v) => v.text);
}
