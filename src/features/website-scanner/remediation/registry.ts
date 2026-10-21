import { PRIORITY_A_DEFINITIONS } from "@/features/website-scanner/remediation/definitions/priorityA";
import { PRIORITY_B_DEFINITIONS } from "@/features/website-scanner/remediation/definitions/priorityB";
import type { DeterministicRemediationDefinition } from "@/features/website-scanner/remediation/types";
import { REMEDIATION_LIBRARY_VERSION } from "@/features/website-scanner/remediation/types";

const ALL: DeterministicRemediationDefinition[] = [
  ...PRIORITY_A_DEFINITIONS,
  ...PRIORITY_B_DEFINITIONS,
];

const BY_RULE = new Map<string, DeterministicRemediationDefinition>(
  ALL.map((d) => [d.ruleId, d]),
);

export function getDeterministicRemediation(
  ruleId: string,
): DeterministicRemediationDefinition | undefined {
  return BY_RULE.get(ruleId);
}

export function hasFullDeterministicRemediation(ruleId: string): boolean {
  const def = BY_RULE.get(ruleId);
  return Boolean(def && def.remediationSteps.length > 0);
}

export function listSupportedDeterministicRuleIds(): string[] {
  return [...BY_RULE.keys()];
}

export function getRemediationLibraryVersion(): number {
  return REMEDIATION_LIBRARY_VERSION;
}

export function buildDeterministicGuidanceStrings(
  def: DeterministicRemediationDefinition,
): string[] {
  const lines: string[] = [];
  lines.push(`Recommended fix (deterministic): ${def.shortProblem}`);
  lines.push(`Why it matters: ${def.whyItMatters}`);
  for (const step of def.remediationSteps.slice(0, 8)) {
    lines.push(`Step: ${step}`);
  }
  if (def.examples?.html) {
    lines.push(
      `Example (HTML): ${def.examples.html.slice(0, 600)}${def.examples.html.length > 600 ? "…" : ""}`,
    );
  }
  if (def.implementationNotes?.length) {
    lines.push(`Notes: ${def.implementationNotes.join(" ")}`);
  }
  return lines;
}
