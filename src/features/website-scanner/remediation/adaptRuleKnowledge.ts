import type {
  DeterministicFixTemplate,
  RuleKnowledge,
} from "@/features/accessibility-intelligence/knowledge/ruleKnowledgeTypes";
import type { DeterministicRemediationDefinition } from "@/features/website-scanner/remediation/types";

export function toRuleKnowledge(
  def: DeterministicRemediationDefinition,
): RuleKnowledge {
  const htmlExample = def.examples?.html ?? "";
  const template: DeterministicFixTemplate = {
    whatIsWrong: def.shortProblem,
    whyItMatters: def.whyItMatters,
    genericPattern: htmlExample || def.remediationSteps.join("\n"),
    whatNotToDo:
      def.implementationNotes?.join(" ") ??
      "Do not apply changes without verifying in your codebase and with a rescan.",
    howToVerify: def.verificationSteps.map((v) => `[${v.kind}] ${v.text}`).join(" "),
  };

  return {
    ruleId: def.ruleId,
    plainTitle: def.title,
    userImpact: def.whyItMatters,
    fixCategory: def.isBestPracticeRule ? "best-practice" : undefined,
    deterministicFixTemplate: template,
    beforeExample: def.examples?.html,
    afterExample: def.examples?.react ?? def.examples?.html,
    manualVerificationSteps: def.verificationSteps.map((v) => v.text),
  };
}
