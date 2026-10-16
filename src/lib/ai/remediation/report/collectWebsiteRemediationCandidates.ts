import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { ReportAiRemediationCandidate } from "@/features/reports/types/reportAiRemediation";
import {
  AI_REMEDIATION_PROMPT_VERSION,
  AI_REMEDIATION_SCHEMA_VERSION,
} from "@/lib/ai/remediation/constants";
import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";

export function collectWebsiteRemediationCandidates(
  session: WebsiteScanSessionState,
  intel: SiteScanIntelligence | null,
): ReportAiRemediationCandidate[] {
  const out: ReportAiRemediationCandidate[] = [];
  for (const [groupId, rem] of Object.entries(session.aiRemediationByGroup ?? {})) {
    const group = intel?.rootCauseGroups.find((g) => g.id === groupId);
    out.push({
      id: `website-${groupId}`,
      source: "website",
      sourceReference: groupId,
      title: rem.report.title,
      generatedAt: rem.generatedAt,
      promptVersion: AI_REMEDIATION_PROMPT_VERSION,
      schemaVersion: AI_REMEDIATION_SCHEMA_VERSION,
      framework: rem.frameworkPreference ?? null,
      remediation: rem.report,
      stale: rem.stale,
      staleReason: rem.stale ? "Generated from previous scan evidence" : null,
      facts: {
        ruleId: (rem.facts.ruleId as string | undefined) ?? group?.ruleId,
        impact: rem.facts.impact as string | undefined,
        priority: undefined,
        pageCount: group?.affectedPages.length ?? (rem.facts.affectedPageCount as number | undefined),
        occurrenceCount:
          group?.totalOccurrences ?? (rem.facts.affectedElementCount as number | undefined),
        pageReference: group?.affectedPages.slice(0, 3).join("; "),
      },
    });
  }
  return out;
}
