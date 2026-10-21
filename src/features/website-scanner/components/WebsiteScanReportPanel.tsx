"use client";

import { useState } from "react";
import { ReportHtmlPreview } from "@/features/reports/components/ReportHtmlPreview";
import "@/features/reports/reportPrint.css";
import { downloadReportJson } from "@/features/reports/utils/exportReportJson";
import { validatePreflightReport } from "@/features/reports/utils/validatePreflightReport";
import { validateEnterpriseReportConsistency } from "@/features/reports/enterprise/validateEnterpriseReportConsistency";
import { buildWebsiteReportFilename } from "@/features/reports/enterprise/buildWebsiteReportFilename";
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
    const ev = validateEnterpriseReportConsistency(built, built.enterpriseView);
    if (!v.ok) console.warn(v.errors);
    if (!ev.ok) console.warn(ev.errors);
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
        buildWebsiteReportFilename(session.rootUrl, report.generatedAt, "pdf"),
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
                  buildWebsiteReportFilename(session.rootUrl, report.generatedAt, "json"),
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
      {report?.websiteExecutivePreflight && (
        <dl className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Failed rules</dt>
            <dd className="font-semibold tabular-nums">
              {report.websiteExecutivePreflight.snapshot.failedAutomatedRules}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Affected occurrences</dt>
            <dd className="font-semibold tabular-nums">
              {report.websiteExecutivePreflight.snapshot.affectedOccurrences}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Needs confirmation</dt>
            <dd className="font-semibold tabular-nums">
              {report.websiteExecutivePreflight.snapshot.needsManualConfirmation}
            </dd>
          </div>
        </dl>
      )}
      {report && (
        <div className="report-print-root">
          <ReportHtmlPreview report={report} />
        </div>
      )}
    </div>
  );
}
