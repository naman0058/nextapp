import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import {
  buildWebsiteScanReport,
  type BuildWebsiteScanReportOptions,
} from "@/features/website-scanner/utils/buildWebsiteScanReport";
import type { ReportAiRemediationAppendix } from "@/features/reports/types/reportAiRemediation";

export function buildWebsiteReportForSession(
  pages: WebsitePageScanResult[],
  session: WebsiteScanSessionState,
  options?: BuildWebsiteScanReportOptions,
) {
  return buildWebsiteScanReport(pages, session, options);
}

export function getWebsiteAiRemediationAppendix(
  pages: WebsitePageScanResult[],
  session: WebsiteScanSessionState,
  options?: BuildWebsiteScanReportOptions,
): ReportAiRemediationAppendix | undefined {
  return buildWebsiteScanReport(pages, session, options).aiRemediationAppendix;
}
