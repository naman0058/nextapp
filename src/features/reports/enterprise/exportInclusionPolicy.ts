import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import type { EnterpriseExportSelection } from "@/features/reports/enterprise/types";

export function buildExportSelectionPolicy(
  session: WebsiteScanSessionState,
): EnterpriseExportSelection {
  const contributions = session.accessibilityWorkspace?.contributions ?? [];
  const included = contributions.filter((c) => c.includedInReport);
  return {
    coreScannerIncluded: true,
    humanReviewIncluded: true,
    contributionsIncludedCount: included.length,
    aiRemediationIncluded:
      session.includeAiRemediationInReport &&
      session.exportPreferences.includeAiRemediationInExports,
    developerGuidanceIncluded: session.includeDeveloperFixGuidanceInReport,
    visualEvidenceIncluded: included.some((c) => c.toolId === "visual_issue_locator"),
  };
}
