import type { FindingDetail } from "@/features/website-scanner/findingDetail/types";
import type {
  ReturnToFindingContext,
  ToolHandoffContext,
  WorkspaceToolId,
} from "@/features/accessibility-workspace/types";
import {
  sanitizeHandoffAltText,
  sanitizeHandoffPageOrigin,
  sanitizeHandoffPath,
  sanitizeHandoffSelector,
} from "@/features/accessibility-workspace/sanitizeHandoffContext";

export function buildReturnToFindingContext(input: {
  websiteSessionId: string;
  detail: FindingDetail;
  resultView?: ReturnToFindingContext["resultView"];
}): ReturnToFindingContext {
  return {
    websiteSessionId: input.websiteSessionId,
    findingId: input.detail.findingId,
    remediationGroupId: input.detail.remediationGroupId,
    ruleId: input.detail.ruleId,
    resultView: input.resultView ?? "issues",
    label: input.detail.title,
    highlightFindingId: input.detail.findingId,
    issuesFilter: { search: input.detail.ruleId },
  };
}

export function buildToolHandoff(input: {
  toolId: WorkspaceToolId;
  detail: FindingDetail;
  websiteSessionId: string;
  resultView?: ReturnToFindingContext["resultView"];
}): ToolHandoffContext {
  const firstUrl = input.detail.affectedUrls[0];
  const firstEvidence = input.detail.evidenceItems[0];
  const contrast = firstEvidence?.contrast;

  return {
    version: 1,
    toolId: input.toolId,
    createdAt: new Date().toISOString(),
    returnTo: buildReturnToFindingContext({
      websiteSessionId: input.websiteSessionId,
      detail: input.detail,
      resultView: input.resultView,
    }),
    ruleId: input.detail.ruleId,
    wcagCriteria: input.detail.wcagMappings.map((m) => m.criterion),
    pageOrigin: sanitizeHandoffPageOrigin(firstUrl),
    pagePath: sanitizeHandoffPath(firstUrl),
    viewportId: firstEvidence?.viewportId ?? input.detail.affectedViewports[0],
    sanitizedSelector: sanitizeHandoffSelector(firstEvidence?.selector),
    foregroundColor: contrast?.foregroundColor,
    backgroundColor: contrast?.backgroundColor,
    measuredContrastRatio: contrast?.measuredContrastRatio,
    requiredRatio: contrast?.requiredRatio,
    scannerTotalOccurrences: input.detail.totalOccurrences,
    scannerRetainedEvidenceCount: input.detail.retainedEvidenceCount,
    evidenceId: firstEvidence?.evidenceId,
    occurrenceIndex: firstEvidence?.occurrenceIndex,
    existingAltText: sanitizeHandoffAltText(firstEvidence?.failureSummary),
  };
}
