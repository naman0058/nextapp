import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import type { AiRemediationSelectionInput } from "@/lib/ai/remediation/report";
import { collectWebsiteRemediationCandidates } from "@/lib/ai/remediation/report";

export function websiteAiRemediationSelectionFromSession(
  session: WebsiteScanSessionState,
  options?: { forExport?: boolean; sampleLabel?: string },
): AiRemediationSelectionInput {
  const includeReport = Boolean(session.includeAiRemediationInReport);
  const includeExport = Boolean(
    options?.forExport && session.exportPreferences.includeAiRemediationInExports,
  );
  const includeAppendix = includeReport || includeExport;
  const candidates = collectWebsiteRemediationCandidates(
    session,
    session.siteIntelligence,
  );
  const selectedIds = candidates
    .filter((c) => {
      if (!session.aiRemediationInclusionById[c.id]) return false;
      if (c.stale) return true;
      return true;
    })
    .map((c) => c.id);
  return {
    includeAppendix,
    selectedIds,
    allowStaleWhenSelected: true,
    sampleLabel: options?.sampleLabel,
  };
}

export function listWebsiteAiRemediationCandidateIds(
  session: WebsiteScanSessionState,
): string[] {
  return collectWebsiteRemediationCandidates(session, session.siteIntelligence).map(
    (c) => c.id,
  );
}
