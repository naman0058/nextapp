"use client";

import { useState } from "react";
import { ReportHtmlPreview } from "@/features/reports/components/ReportHtmlPreview";
import "@/features/reports/reportPrint.css";
import { downloadReportJson } from "@/features/reports/utils/exportReportJson";
import { validatePreflightReport } from "@/features/reports/utils/validatePreflightReport";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import { buildWebsiteScanReport } from "@/features/website-scanner/utils/buildWebsiteScanReport";
import { collectWebsiteRemediationCandidates } from "@/lib/ai/remediation/report";

type Props = {
  pages: WebsitePageScanResult[];
  session: WebsiteScanSessionState;
};

export function WebsiteScanReportPanel({ pages, session }: Props) {
  const [report, setReport] = useState<ReturnType<
    typeof buildWebsiteScanReport
  > | null>(null);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);

  function generate() {
    const built = buildWebsiteScanReport(pages, session);
    const v = validatePreflightReport(built);
    if (!v.ok) {
      console.warn(v.errors);
    }
    setReport(built);
  }

  async function handlePdf() {
    if (!report) return;
    setPdfStatus("Preparing PDF…");
    try {
      const { exportReportPdf } = await import(
        "@/features/reports/pdf/exportReportPdf"
      );
      await exportReportPdf(
        report,
        `website-scan-report-${session.sessionId.slice(0, 8)}.pdf`,
      );
      setPdfStatus("PDF downloaded.");
    } catch {
      setPdfStatus("PDF export failed. Use Print / Save PDF.");
    }
  }

  const candidateCount = collectWebsiteRemediationCandidates(
    session,
    session.siteIntelligence,
  ).length;

  return (
    <div className="space-y-4 border-t border-border pt-6">
      <h3 className="font-display text-lg font-bold">Preflight report</h3>
      {session.includeAiRemediationInReport && candidateCount === 0 ? (
        <p className="text-sm text-muted">
          No AI remediation has been generated for this scan. Use Fix Lab to
          generate guidance first.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg border border-border px-3 py-1.5 text-sm"
          onClick={generate}
        >
          Generate report preview
        </button>
        {report && (
          <>
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-1.5 text-sm"
              onClick={() =>
                downloadReportJson(
                  report,
                  `website-scan-report-${session.sessionId.slice(0, 8)}.json`,
                )
              }
            >
              Download report JSON
            </button>
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-1.5 text-sm"
              onClick={() => void handlePdf()}
            >
              Download PDF
            </button>
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-1.5 text-sm"
              onClick={() => window.print()}
            >
              Print / Save PDF
            </button>
          </>
        )}
      </div>
      {pdfStatus ? (
        <p className="text-xs text-muted" role="status">
          {pdfStatus}
        </p>
      ) : null}
      {report && (
        <div className="report-print-root">
          <ReportHtmlPreview report={report} />
        </div>
      )}
    </div>
  );
}
