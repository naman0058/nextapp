"use client";

import { useCallback, useState } from "react";
import type { SampleAccessibilityReportFixture } from "@/features/sample-report/buildSampleAccessibilityReportFixture";
import { buildSampleEvidencePackageZip } from "@/features/sample-report/buildSampleEvidencePackage";
import { downloadSampleSessionJson } from "@/features/sample-report/exportSampleSessionJson";
import { SAMPLE_EXPORT_FILENAMES } from "@/features/sample-report/constants";
import { buildWebsiteScanReport } from "@/features/website-scanner/utils/buildWebsiteScanReport";
import { exportWebsiteFindingsCsv } from "@/features/website-scanner/utils/export/exportWebsiteFindingsCsv";
import { SampleExcelPreview } from "@/features/sample-report/components/SampleExcelPreview";
import { ReportHtmlPreview } from "@/features/reports/components/ReportHtmlPreview";
import "@/features/reports/reportPrint.css";

type Props = {
  fixture: SampleAccessibilityReportFixture;
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function SampleExportSection({ fixture }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [reportPreview, setReportPreview] = useState<
    ReturnType<typeof buildWebsiteScanReport> | null
  >(null);
  const [busy, setBusy] = useState<string | null>(null);

  const run = useCallback(
    async (key: string, fn: () => Promise<void>) => {
      if (busy) return;
      setBusy(key);
      setStatus(null);
      try {
        await fn();
        setStatus(`${key} ready.`);
      } catch {
        setStatus(`Could not prepare ${key}. Try again.`);
      } finally {
        setBusy(null);
      }
    },
    [busy],
  );

  return (
    <section id="sample-exports" aria-labelledby="sample-exports-heading" className="space-y-6">
      <h2 id="sample-exports-heading" className="text-2xl font-semibold">
        Download the sample report
      </h2>
      <p className="text-muted-foreground">
        Exports are generated in your browser from the same fictional dataset — no signup and no
        server storage.
      </p>
      <SampleExcelPreview fixture={fixture} />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!!busy}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          onClick={() =>
            void run("Preview Sample PDF", async () => {
              const report = buildWebsiteScanReport(fixture.completedPages, fixture.session, {
                forceIncludeAiRemediation: true,
                sampleLabel: "Sample AI-Assisted Guidance",
              });
              setReportPreview(report);
              setPreviewOpen(true);
            })
          }
        >
          {busy === "Preview Sample PDF" ? "Preparing sample PDF…" : "Preview Sample PDF"}
        </button>
        <button
          type="button"
          disabled={!!busy}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
          onClick={() =>
            void run("Download Sample PDF", async () => {
              const { exportReportPdf } = await import("@/features/reports/pdf/exportReportPdf");
              const report = buildWebsiteScanReport(fixture.completedPages, fixture.session, {
                forceIncludeAiRemediation: true,
                sampleLabel: "Sample AI-Assisted Guidance",
              });
              await exportReportPdf(report, SAMPLE_EXPORT_FILENAMES.pdf, {
                sampleBanner: "SAMPLE / Fictional demonstration — not a real audit",
              });
            })
          }
        >
          Download Sample PDF
        </button>
        <button
          type="button"
          disabled={!!busy}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
          onClick={() =>
            void run("Download Sample Excel", async () => {
              const { exportWebsiteWorkbook } = await import(
                "@/features/website-scanner/utils/export/exportWebsiteWorkbook"
              );
              const sampleSession = {
                ...fixture.session,
                exportPreferences: {
                  ...fixture.session.exportPreferences,
                  includeAiRemediationInExports: true,
                },
                includeAiRemediationInReport: true,
                aiRemediationInclusionById: Object.fromEntries(
                  Object.keys(fixture.session.aiRemediationByGroup).map((gid) => [
                    `website-${gid}`,
                    true,
                  ]),
                ),
              };
              const blob = await exportWebsiteWorkbook(
                sampleSession,
                fixture.completedPages,
              );
              downloadBlob(blob, SAMPLE_EXPORT_FILENAMES.xlsx);
            })
          }
        >
          Download Sample Excel (.xlsx)
        </button>
        <button
          type="button"
          disabled={!!busy}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
          onClick={() => {
            exportWebsiteFindingsCsv(
              fixture.completedPages,
              fixture.session.siteIntelligence,
              SAMPLE_EXPORT_FILENAMES.csv,
            );
            setStatus("Sample CSV download started.");
          }}
        >
          Download Sample CSV
        </button>
        <button
          type="button"
          disabled={!!busy}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
          onClick={() => {
            downloadSampleSessionJson(fixture.session, SAMPLE_EXPORT_FILENAMES.json);
            setStatus("Sample JSON download started.");
          }}
        >
          Download Sample JSON
        </button>
        <button
          type="button"
          disabled={!!busy}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
          onClick={() =>
            void run("Download Sample Evidence Package", async () => {
              const blob = await buildSampleEvidencePackageZip(fixture);
              downloadBlob(blob, SAMPLE_EXPORT_FILENAMES.zip);
            })
          }
        >
          Download Sample Evidence Package
        </button>
      </div>
      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
      {previewOpen && reportPreview ? (
        <dialog open className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-background p-4 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold">Sample report preview</h3>
              <button
                type="button"
                className="rounded border border-border px-3 py-1 text-sm"
                onClick={() => {
                  setPreviewOpen(false);
                  setReportPreview(null);
                }}
              >
                Close
              </button>
            </div>
            <div className="report-print-root mt-4">
              <ReportHtmlPreview report={reportPreview} />
            </div>
          </div>
        </dialog>
      ) : null}
    </section>
  );
}
