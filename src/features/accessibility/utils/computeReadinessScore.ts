import { SCORE_BANDS, SCORE_WEIGHTS } from "@/features/accessibility/constants/thresholds";
import type {
  AccessibilityCheckResult,
  PreflightCounts,
} from "@/features/accessibility/types/preflight";

export function countResults(
  checks: AccessibilityCheckResult[],
): PreflightCounts {
  const counts: PreflightCounts = {
    pass: 0,
    review: 0,
    fail: 0,
    not_checked: 0,
  };
  for (const check of checks) {
    counts[check.status]++;
  }
  return counts;
}

export function computeReadinessScore(
  checks: AccessibilityCheckResult[],
): { score: number; scoreBandLabel: string } {
  let score = 100;

  for (const check of checks) {
    if (check.status === "pass" || check.status === "not_checked") continue;
    if (check.severity === "info") continue;

    const weights = SCORE_WEIGHTS[check.status];
    const deduction = weights[check.severity] ?? 0;
    score -= deduction;
  }

  score = Math.max(0, Math.min(100, score));

  const band =
    SCORE_BANDS.find((b) => score >= b.min)?.label ??
    SCORE_BANDS[SCORE_BANDS.length - 1].label;

  return { score, scoreBandLabel: band };
}
