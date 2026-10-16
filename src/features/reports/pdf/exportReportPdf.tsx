import { pdf } from "@react-pdf/renderer";
import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";
import { PreflightReportDocument } from "@/features/reports/pdf/PreflightReportDocument";

export async function exportReportPdf(
  report: AccessibilityPreflightReport,
  filename: string,
  options?: { sampleBanner?: string },
): Promise<void> {
  const blob = await pdf(
    <PreflightReportDocument report={report} sampleBanner={options?.sampleBanner} />,
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
