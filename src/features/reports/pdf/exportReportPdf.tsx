import { pdf } from "@react-pdf/renderer";
import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";
import { PreflightReportDocument } from "@/features/reports/pdf/PreflightReportDocument";
import { WebsiteEnterprisePdfDocument } from "@/features/reports/pdf/WebsiteEnterprisePdfDocument";

export async function exportReportPdf(
  report: AccessibilityPreflightReport,
  filename: string,
  options?: { sampleBanner?: string },
): Promise<void> {
  const doc =
    report.contentType === "website_scan" && report.enterpriseView ? (
      <WebsiteEnterprisePdfDocument report={report} sampleBanner={options?.sampleBanner} />
    ) : (
      <PreflightReportDocument report={report} sampleBanner={options?.sampleBanner} />
    );
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
