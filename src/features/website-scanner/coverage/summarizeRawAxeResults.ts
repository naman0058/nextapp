import type { AxeResults } from "axe-core";
import { isBestPracticeRule } from "@/features/website-scanner/server/axe/wcagFromTags";
import type {
  RawAxeRuleBucket,
  RawAxeRuleInventoryItem,
} from "@/features/website-scanner/coverage/types";

function mapBucketItems(
  bucket: RawAxeRuleBucket,
  rules: Array<{
    id: string;
    impact?: string | null;
    tags: string[];
    nodes: unknown[];
  }>,
): RawAxeRuleInventoryItem[] {
  return rules.map((rule) => ({
    ruleId: rule.id,
    bucket,
    nodeCount: rule.nodes.length,
    impact: rule.impact ?? null,
    tags: [...rule.tags],
    isBestPractice: isBestPracticeRule(rule.tags),
  }));
}

export function summarizeRawAxeResults(results: AxeResults): RawAxeRuleInventoryItem[] {
  return [
    ...mapBucketItems("violations", results.violations),
    ...mapBucketItems("incomplete", results.incomplete),
    ...mapBucketItems("passes", results.passes),
    ...mapBucketItems("inapplicable", results.inapplicable),
  ];
}

export function countRawAxeBuckets(inventory: RawAxeRuleInventoryItem[]): {
  violations: number;
  incomplete: number;
  passes: number;
  inapplicable: number;
} {
  const counts = { violations: 0, incomplete: 0, passes: 0, inapplicable: 0 };
  for (const item of inventory) {
    counts[item.bucket] += 1;
  }
  return counts;
}
