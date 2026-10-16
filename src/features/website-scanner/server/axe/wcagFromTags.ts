import type { AccessibilityRuleLevel } from "@/features/website-scanner/types/scanTypes";
import { AXE_BEST_PRACTICE_TAG } from "@/features/website-scanner/constants/axeScanConfig";

export function wcagTagToCriterion(tag: string): string | null {
  const m = /^wcag(\d)(\d)(\d)$/i.exec(tag);
  if (!m) return null;
  return `${m[1]}.${m[2]}.${m[3]}`;
}

export function extractWcagCriteria(tags: string[]): string[] {
  const set = new Set<string>();
  for (const tag of tags) {
    const c = wcagTagToCriterion(tag);
    if (c) set.add(c);
  }
  return [...set].sort();
}

export function deriveRuleLevel(tags: string[]): AccessibilityRuleLevel {
  if (tags.includes(AXE_BEST_PRACTICE_TAG)) return "best-practice";
  const lower = tags.map((t) => t.toLowerCase());
  if (lower.some((t) => t.includes("wcag2aa") || t.includes("wcag21aa") || t.includes("wcag22aa"))) {
    return "AA";
  }
  if (lower.some((t) => t.includes("wcag2a") || t.includes("wcag21a"))) {
    return "A";
  }
  return "other";
}

export function isBestPracticeRule(tags: string[]): boolean {
  return tags.includes(AXE_BEST_PRACTICE_TAG);
}
