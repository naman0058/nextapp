import type { DeterministicFixTemplate } from "@/features/accessibility-intelligence/knowledge/ruleKnowledge";
import { getVerificationStepsForRule } from "@/features/accessibility-intelligence/knowledge/ruleKnowledge";

export function verificationStepsForTicket(input: {
  ruleId: string;
  template?: DeterministicFixTemplate;
  humanReviewRequired?: boolean;
  likelySharedComponent?: boolean;
  hasAutomatedRule: boolean;
}): string[] {
  const steps: string[] = [];
  if (input.likelySharedComponent) {
    steps.push(
      "Implement the change in the shared component or template before editing each occurrence independently.",
    );
  } else {
    steps.push("Apply the fix on each affected page or component instance.");
  }
  const manual = getVerificationStepsForRule(input.ruleId);
  if (manual.length > 0) {
    steps.push(...manual.slice(0, 4));
  } else if (input.template?.howToVerify) {
    steps.push(input.template.howToVerify);
  }
  steps.push("Test affected controls using keyboard navigation.");
  steps.push("Inspect accessible names, labels, or contrast where relevant.");
  if (input.hasAutomatedRule) {
    steps.push("Re-run the Website Accessibility Scanner on affected pages.");
    steps.push(
      `Confirm the \`${input.ruleId}\` finding is no longer detected for affected occurrences.`,
    );
  }
  if (input.humanReviewRequired) {
    steps.push("Complete related human-review checks from the scan results.");
  }
  return dedupeSteps(steps);
}

function dedupeSteps(steps: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of steps) {
    const key = s.toLowerCase().slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}
