import type { WebsitePageScanRequest } from "@/features/website-scanner/types/scanTypes";

export function shouldCaptureCoverageAudit(
  request?: Pick<WebsitePageScanRequest, "captureCoverageAudit">,
): boolean {
  if (request?.captureCoverageAudit) return true;
  if (process.env.WEBSITE_SCANNER_COVERAGE_AUDIT === "1") return true;
  return process.env.NODE_ENV === "test";
}
