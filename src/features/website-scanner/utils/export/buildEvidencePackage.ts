import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { exportWebsiteWorkbook } from "@/features/website-scanner/utils/export/exportWebsiteWorkbook";
import { buildWebsiteScanReport } from "@/features/website-scanner/utils/buildWebsiteScanReport";
import { buildAllDeveloperTicketsFromSession } from "@/features/website-scanner/developerTicket/buildDeveloperTicketFromSession";
import { formatDeveloperTicketsBulkMarkdown } from "@/features/website-scanner/developerTicket/formatDeveloperTicketsBulkMarkdown";
import { formatAiRemediationAppendixMarkdown } from "@/lib/ai/remediation/report";
import { toExportableAiRemediationJson } from "@/lib/ai/remediation/report";
import { getWebsiteAiRemediationAppendix } from "@/features/website-scanner/utils/getWebsiteReportWithAi";

export async function buildEvidencePackageZip(
  session: WebsiteScanSessionState,
  completedPages: WebsitePageScanResult[],
): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const xlsx = await exportWebsiteWorkbook(session);
  zip.file("accessibility-results.xlsx", xlsx);
  zip.file("results.json", JSON.stringify(session, null, 2));
  const report = buildWebsiteScanReport(completedPages, session, { forExport: true });
  zip.file("accessibility-report.json", JSON.stringify(report, null, 2));
  const aiAppendix = getWebsiteAiRemediationAppendix(completedPages, session, {
    forExport: true,
  });
  if (aiAppendix) {
    zip.file("ai-remediation.md", formatAiRemediationAppendixMarkdown(aiAppendix));
    zip.file(
      "ai-remediation.json",
      JSON.stringify(toExportableAiRemediationJson(aiAppendix.entries), null, 2),
    );
  }
  const tickets = buildAllDeveloperTicketsFromSession(session, completedPages);
  zip.file("developer-tickets.md", formatDeveloperTicketsBulkMarkdown(tickets));
  zip.file(
    "README.txt",
    [
      "Accessible Content Preflight — Evidence Package",
      "",
      `Generated: ${new Date().toISOString()}`,
      `Scan URL: ${session.rootUrl}`,
      `Pages scanned: ${session.scanScope.pagesCompleted}`,
      `Viewport: ${session.viewportMode}`,
      "",
      "This package contains scan results only — not a full copy of the target website.",
      "Automated scans do not certify WCAG/ADA compliance.",
      "",
      "Files:",
      "- accessibility-results.xlsx",
      "- results.json (session export)",
      "- accessibility-report.json (preflight report model)",
      "- developer-tickets.md (deterministic remediation handoff)",
      ...(aiAppendix
        ? [
            "- ai-remediation.md / ai-remediation.json (optional AI guidance — review before use)",
          ]
        : []),
      "",
      "Report export does not contact OpenAI. AI remediation files contain guidance only.",
    ].join("\n"),
  );
  return zip.generateAsync({ type: "blob" });
}
