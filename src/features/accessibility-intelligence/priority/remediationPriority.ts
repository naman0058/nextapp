import type { RemediationPriority } from "@/features/accessibility-intelligence/types/normalizedFinding";
import type { AxeImpact } from "@/features/website-scanner/types/scanTypes";

export type PriorityInput = {
  impact: AxeImpact;
  occurrenceCount: number;
  affectedPageCount: number;
  likelySharedComponent: boolean;
  sharedConfidence: "high" | "medium" | "low";
  wcagLevel?: "A" | "AA" | "AAA" | null;
  humanReviewRequired: boolean;
};

const IMPACT_WEIGHT: Record<AxeImpact, number> = {
  critical: 40,
  serious: 30,
  moderate: 20,
  minor: 10,
  unknown: 5,
};

export function computePriorityScore(input: PriorityInput): number {
  let score = IMPACT_WEIGHT[input.impact] ?? 5;
  score += Math.min(15, Math.log2(Math.max(1, input.occurrenceCount)) * 4);
  score += Math.min(10, input.affectedPageCount * 2);
  if (input.likelySharedComponent && input.sharedConfidence !== "low") {
    score += input.sharedConfidence === "high" ? 12 : 6;
  }
  if (input.wcagLevel === "A") score += 3;
  else if (input.wcagLevel === "AA") score += 2;
  if (input.humanReviewRequired) score += 1;
  return score;
}

export function scoreToPriority(score: number): RemediationPriority {
  if (score >= 45) return "high";
  if (score >= 28) return "medium";
  return "low";
}

export function computeRemediationPriority(input: PriorityInput): {
  priority: RemediationPriority;
  reasonForPriority: string;
} {
  const score = computePriorityScore(input);
  const priority = scoreToPriority(score);
  const parts: string[] = [];
  parts.push(`${input.impact} impact`);
  if (input.affectedPageCount > 1) {
    parts.push(`${input.affectedPageCount} pages affected`);
  }
  if (input.occurrenceCount > 1) {
    parts.push(`${input.occurrenceCount} occurrences`);
  }
  if (input.likelySharedComponent && input.sharedConfidence !== "low") {
    parts.push("likely shared component pattern");
  }
  const reasonForPriority = `Priority considers ${parts.join(", ")}. This is not a legal-risk rating.`;
  return { priority, reasonForPriority };
}

export const PRIORITY_EXPLANATION =
  "Priority considers issue impact, repetition and likely remediation reach. It is not a legal-risk rating.";
