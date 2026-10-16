import { buildWebsiteScanReport } from "@/features/website-scanner/utils/buildWebsiteScanReport";
import { exportWebsiteWorkbook } from "@/features/website-scanner/utils/export/exportWebsiteWorkbook";
import { formatDeveloperTicketsBulkMarkdown } from "@/features/website-scanner/developerTicket/formatDeveloperTicketsBulkMarkdown";
import { buildAllDeveloperTicketsFromSession } from "@/features/website-scanner/developerTicket/buildDeveloperTicketFromSession";
import { sanitizeSampleSessionForExport } from "@/features/sample-report/exportSampleSessionJson";
import type { SampleAccessibilityReportFixture } from "@/features/sample-report/buildSampleAccessibilityReportFixture";
import { SAMPLE_EXPORT_FILENAMES } from "@/features/sample-report/constants";
import {
  formatAiRemediationAppendixMarkdown,
  toExportableAiRemediationJson,
} from "@/lib/ai/remediation/report";

export async function buildSampleEvidencePackageZip(
  fixture: SampleAccessibilityReportFixture,
): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const { session, completedPages } = fixture;

  const sampleSession = {
    ...session,
    exportPreferences: {
      ...session.exportPreferences,
      includeAiRemediationInExports: true,
    },
    includeAiRemediationInReport: true,
    aiRemediationInclusionById: Object.fromEntries(
      Object.keys(session.aiRemediationByGroup).map((gid) => [`website-${gid}`, true]),
    ),
  };
  const xlsx = await exportWebsiteWorkbook(sampleSession, completedPages);
  zip.file(SAMPLE_EXPORT_FILENAMES.xlsx.replace(".xlsx", ".xlsx"), xlsx);
  zip.file(
    SAMPLE_EXPORT_FILENAMES.json,
    JSON.stringify(sanitizeSampleSessionForExport(session), null, 2),
  );
  const report = buildWebsiteScanReport(completedPages, session, {
    forceIncludeAiRemediation: true,
    sampleLabel: "Sample AI-Assisted Guidance",
  });
  zip.file("sample-accessibility-report-model.json", JSON.stringify(report, null, 2));
  if (report.aiRemediationAppendix) {
    zip.file(
      "ai-remediation.md",
      formatAiRemediationAppendixMarkdown(report.aiRemediationAppendix),
    );
    zip.file(
      "ai-remediation.json",
      JSON.stringify(
        toExportableAiRemediationJson(report.aiRemediationAppendix.entries),
        null,
        2,
      ),
    );
  }
  const tickets = buildAllDeveloperTicketsFromSession(session, completedPages);
  zip.file("sample-developer-ticket.md", formatDeveloperTicketsBulkMarkdown(tickets));
  zip.file(
    "README.txt",
    [
      "Accessible Content Preflight — Sample Evidence Package",
      "",
      "Fictional demonstration data only — not a real audit.",
      "No WCAG/ADA certification or legal compliance is implied.",
      "",
      "Files included:",
      `- ${SAMPLE_EXPORT_FILENAMES.xlsx}`,
      `- ${SAMPLE_EXPORT_FILENAMES.json}`,
      "- sample-accessibility-report-model.json",
      "- sample-developer-ticket.md",
      "- ai-remediation.md / ai-remediation.json (sample AI guidance — review before use)",
      "",
      "Exports are generated locally; OpenAI is not called during export.",
    ].join("\n"),
  );

  return zip.generateAsync({ type: "blob" });
}
