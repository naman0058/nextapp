import type { FindingEvidenceItem } from "@/features/website-scanner/findingDetail/types";
import {
  ariaFieldsFromContext,
  parseContrastFromFailureSummary,
} from "@/features/website-scanner/findingDetail/parseAxeEvidenceFields";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

function collectFromRuleNodes(
  pages: WebsitePageScanResult[],
  ruleId: string,
  bucket: "violations" | "incomplete",
  isBestPractice?: boolean,
): FindingEvidenceItem[] {
  const items: FindingEvidenceItem[] = [];
  let globalIndex = 0;
  for (const page of pages) {
    const list =
      bucket === "violations" ? page.violations : page.incomplete;
    for (const rule of list) {
      if (rule.id !== ruleId) continue;
      if (
        bucket === "violations" &&
        "isBestPractice" in rule &&
        rule.isBestPractice !== Boolean(isBestPractice)
      ) {
        continue;
      }
      const ruleImpact =
        bucket === "violations" ? rule.impact : rule.impact;
      for (const node of rule.nodes) {
        globalIndex += 1;
        const failureSummary = node.failureSummary;
        items.push({
          evidenceId: `${page.finalUrl}::${page.viewport.id}::${ruleId}::${globalIndex}`,
          pageUrl: page.finalUrl,
          viewportId: page.viewport.id,
          selector: node.selectorLabel,
          htmlSnippet: node.htmlSnippet,
          failureSummary,
          nodeImpact: ruleImpact,
          occurrenceIndex: globalIndex,
          contrast: parseContrastFromFailureSummary(failureSummary, ruleId),
          aria: ariaFieldsFromContext(
            node.elementContext,
            node.htmlSnippet,
            failureSummary,
          ),
        });
      }
    }
  }
  return items;
}

export function collectRetainedEvidenceForRule(
  pages: WebsitePageScanResult[],
  ruleId: string,
  options?: { bestPractice?: boolean; incomplete?: boolean },
): FindingEvidenceItem[] {
  if (options?.incomplete) {
    return collectFromRuleNodes(pages, ruleId, "incomplete");
  }
  return collectFromRuleNodes(
    pages,
    ruleId,
    "violations",
    options?.bestPractice ?? false,
  );
}

export function buildPageViewportScopes(
  pages: WebsitePageScanResult[],
  ruleId: string,
  options?: { incomplete?: boolean; bestPractice?: boolean },
): import("@/features/website-scanner/findingDetail/types").PageViewportScope[] {
  const scopes: import("@/features/website-scanner/findingDetail/types").PageViewportScope[] =
    [];
  for (const page of pages) {
    const violations = options?.incomplete ? page.incomplete : page.violations;
    for (const v of violations) {
      if (v.id !== ruleId) continue;
      if (
        !options?.incomplete &&
        "isBestPractice" in v &&
        v.isBestPractice !== Boolean(options?.bestPractice)
      ) {
        continue;
      }
      scopes.push({
        pageUrl: page.finalUrl,
        viewportId: page.viewport.id,
        occurrenceCount: v.totalNodeCount,
      });
    }
  }
  return scopes;
}
