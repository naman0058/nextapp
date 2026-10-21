import type { EnterprisePreflightReport } from "@/features/reports/enterprise/types";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import { collectPageScanResults } from "@/features/website-scanner/utils/collectPageScanResults";
import { buildWebsiteScanReport } from "@/features/website-scanner/utils/buildWebsiteScanReport";

export function buildEnterpriseFromSession(
  session: WebsiteScanSessionState,
  pages?: WebsitePageScanResult[],
  reportOptions?: { forExport?: boolean },
): EnterprisePreflightReport | null {
  const completed =
    pages ?? collectPageScanResults(session.pages.filter((p) => p.status === "complete"));
  const report = buildWebsiteScanReport(completed, session, reportOptions);
  return report.enterpriseView ?? null;
}
