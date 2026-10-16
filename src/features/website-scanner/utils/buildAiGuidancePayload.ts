import type { RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

export type AiGuidanceRulePayload = {
  ruleId: string;
  impact: string;
  help: string;
  description: string;
  wcagCriteria: string[];
  pagePath: string;
  failureSummaries: string[];
  htmlSnippets: string[];
};

export function buildAiPayloadFromRootCauseGroup(
  group: RootCauseGroup,
  completedPages: WebsitePageScanResult[],
  maxSnippets = 3,
): AiGuidanceRulePayload {
  const samplePage = completedPages.find((p) =>
    p.violations.some((v) => v.id === group.ruleId),
  );
  const v = samplePage?.violations.find((x) => x.id === group.ruleId);
  const snippets = group.representativeEvidence
    .map((e) => e.htmlSnippet)
    .filter(Boolean)
    .slice(0, maxSnippets) as string[];
  return {
    ruleId: group.ruleId,
    impact: v?.impact ?? "unknown",
    help: group.label,
    description: `${group.totalOccurrences} occurrence(s) across ${group.affectedPages.length} page(s).`,
    wcagCriteria: v?.wcagCriteria ?? [],
    pagePath: group.affectedPages[0]
      ? safePathname(group.affectedPages[0])
      : "/",
    failureSummaries: group.representativeEvidence
      .map((e) => e.evidenceText)
      .filter(Boolean) as string[],
    htmlSnippets: snippets,
  };
}

function safePathname(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return "/";
  }
}
