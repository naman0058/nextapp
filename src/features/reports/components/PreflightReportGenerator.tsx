"use client";

import { useCallback, useMemo, useState } from "react";
import { AppField } from "@/components/app/AppField";
import { AppPanel } from "@/components/app/AppPanel";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { ReportHtmlPreview } from "@/features/reports/components/ReportHtmlPreview";
import "@/features/reports/reportPrint.css";
import type { ReportProjectInfo } from "@/features/reports/types/reportModel";
import type { ReportSettings } from "@/features/reports/types/reportSettings";
import { DEFAULT_REPORT_SETTINGS } from "@/features/reports/types/reportSettings";
import type { PreflightReportSourceSnapshot } from "@/features/reports/types/reportSource";
import { applyReportSettings } from "@/features/reports/utils/applyReportSettings";
import { buildAccessibilityPreflightReport } from "@/features/reports/utils/buildReport";
import { computeSourceFingerprint } from "@/features/reports/utils/computeSourceFingerprint";
import { createReportThumbnailFromUrl } from "@/features/reports/utils/createReportThumbnail";
import {
  copyReportTextSummary,
  downloadReportTextSummary,
} from "@/features/reports/utils/exportReportTextSummary";
import { downloadReportJson } from "@/features/reports/utils/exportReportJson";
import { hasMeaningfulChecks } from "@/features/reports/utils/hasMeaningfulChecks";
import {
  defaultReportFilenameParts,
  sanitizeReportFilename,
} from "@/features/reports/utils/sanitizeReportFilename";
import { validatePreflightReport } from "@/features/reports/utils/validatePreflightReport";
import { ReportAiRemediationInclusionPanel } from "@/features/reports/components/ReportAiRemediationInclusionPanel";
import { collectAllFromReportSource } from "@/lib/ai/remediation/report";
import { downloadAiRemediationCsv } from "@/features/reports/utils/exportAiRemediationCsv";

type PreflightReportGeneratorProps = {
  source: PreflightReportSourceSnapshot;
  imagePreviewUrl?: string | null;
  heading?: string;
};

const SETTING_LABELS: { key: keyof ReportSettings; label: string }[] = [
  { key: "includeContentText", label: "Include caption text" },
  { key: "includeAltText", label: "Include alt text" },
  { key: "includeImageThumbnail", label: "Include image thumbnail" },
  { key: "includeAiFindings", label: "Include AI-assisted findings" },
  { key: "includeDetailedFindings", label: "Include detailed findings" },
  { key: "includeHumanReviewChecklist", label: "Include human review tasks" },
  { key: "includeFullVideoTranscript", label: "Include full video transcript" },
  { key: "includeMethodology", label: "Include methodology section" },
  { key: "includeInternalNotes", label: "Include internal notes" },
  { key: "includeTechnicalDetails", label: "Include technical check IDs" },
  {
    key: "includeAiRemediationAppendix",
    label: "Include AI-Assisted Remediation appendix",
  },
];

export function PreflightReportGenerator({
  source,
  imagePreviewUrl,
  heading = "Accessibility preflight report",
}: PreflightReportGeneratorProps) {
  const [projectInfo, setProjectInfo] = useState<ReportProjectInfo>({});
  const [settings, setSettings] = useState<ReportSettings>({
    ...DEFAULT_REPORT_SETTINGS,
  });
  const [previewReport, setPreviewReport] = useState<ReturnType<
    typeof buildAccessibilityPreflightReport
  > | null>(null);
  const [previewFingerprint, setPreviewFingerprint] = useState<string | null>(
    null,
  );
  const [status, setStatus] = useState<string | null>(null);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [aiInclusionById, setAiInclusionById] = useState<Record<string, boolean>>(
    {},
  );

  const aiCandidates = useMemo(
    () => collectAllFromReportSource(source),
    [source],
  );

  const liveFingerprint = useMemo(
    () => computeSourceFingerprint(source),
    [source],
  );
  const canGenerate = hasMeaningfulChecks(source);
  const stale =
    previewReport &&
    previewFingerprint &&
    previewFingerprint !== liveFingerprint;

  const displayReport = useMemo(() => {
    if (!previewReport) return null;
    return applyReportSettings(previewReport, settings);
  }, [previewReport, settings]);

  const filenameBase = defaultReportFilenameParts({
    platform: source.platform,
    client: projectInfo.clientOrganization,
    campaign: projectInfo.campaignProjectName,
  });

  const generate = useCallback(async () => {
    setBusy(true);
    setStatus(null);
    try {
      let thumbnail: string | null = null;
      if (settings.includeImageThumbnail && imagePreviewUrl) {
        thumbnail = await createReportThumbnailFromUrl(imagePreviewUrl);
      }
      const selectedIds = Object.entries(aiInclusionById)
        .filter(([, v]) => v)
        .map(([id]) => id);
      const built = buildAccessibilityPreflightReport(
        source,
        projectInfo,
        settings,
        {
          imageThumbnailDataUrl: thumbnail,
          aiRemediationSelection: {
            includeAppendix: settings.includeAiRemediationAppendix,
            selectedIds,
            allowStaleWhenSelected: true,
          },
        },
      );
      const validation = validatePreflightReport(built);
      if (!validation.ok) {
        setStatus(validation.errors.join(" "));
        return;
      }
      setPreviewReport(built);
      setPreviewFingerprint(liveFingerprint);
      setStatus("Report preview updated.");
    } finally {
      setBusy(false);
    }
  }, [
    source,
    projectInfo,
    settings,
    imagePreviewUrl,
    liveFingerprint,
    aiInclusionById,
  ]);

  async function handlePdf() {
    if (!displayReport) return;
    setPdfStatus("Preparing PDF…");
    try {
      const { exportReportPdf } = await import(
        "@/features/reports/pdf/exportReportPdf"
      );
      await exportReportPdf(
        displayReport,
        sanitizeReportFilename(filenameBase, "pdf"),
      );
      setPdfStatus("PDF downloaded.");
    } catch {
      setPdfStatus(
        "PDF export failed. Use Print Report for a PDF from your browser.",
      );
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <AppPanel
      id="preflight-report"
      title={heading}
      description="Generate a client-ready report from checks already run in this browser session. Export does not call AI or upload content."
    >
      <div className="acps-report-no-print space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <AppField label="Report title" htmlFor="rpt-title">
            <input
              id="rpt-title"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={projectInfo.reportTitle ?? ""}
              onChange={(e) =>
                setProjectInfo((p) => ({ ...p, reportTitle: e.target.value }))
              }
            />
          </AppField>
          <AppField label="Client / organization" htmlFor="rpt-client">
            <input
              id="rpt-client"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={projectInfo.clientOrganization ?? ""}
              onChange={(e) =>
                setProjectInfo((p) => ({
                  ...p,
                  clientOrganization: e.target.value,
                }))
              }
            />
          </AppField>
          <AppField label="Campaign / project" htmlFor="rpt-campaign">
            <input
              id="rpt-campaign"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={projectInfo.campaignProjectName ?? ""}
              onChange={(e) =>
                setProjectInfo((p) => ({
                  ...p,
                  campaignProjectName: e.target.value,
                }))
              }
            />
          </AppField>
          <AppField label="Content ID" htmlFor="rpt-content-id">
            <input
              id="rpt-content-id"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={projectInfo.contentIdentifier ?? ""}
              onChange={(e) =>
                setProjectInfo((p) => ({
                  ...p,
                  contentIdentifier: e.target.value,
                }))
              }
            />
          </AppField>
          <AppField label="Prepared by" htmlFor="rpt-prepared">
            <input
              id="rpt-prepared"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={projectInfo.preparedBy ?? ""}
              onChange={(e) =>
                setProjectInfo((p) => ({ ...p, preparedBy: e.target.value }))
              }
            />
          </AppField>
          {settings.includeInternalNotes ? (
            <AppField label="Internal notes" htmlFor="rpt-notes">
              <textarea
                id="rpt-notes"
                rows={3}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                value={projectInfo.internalNotes ?? ""}
                onChange={(e) =>
                  setProjectInfo((p) => ({
                    ...p,
                    internalNotes: e.target.value,
                  }))
                }
              />
            </AppField>
          ) : null}
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-foreground">
            Privacy & export options
          </legend>
          <ul className="grid gap-2 sm:grid-cols-2">
            {SETTING_LABELS.map(({ key, label }) => (
              <li key={key}>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, [key]: e.target.checked }))
                    }
                  />
                  {label}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <ReportAiRemediationInclusionPanel
          masterEnabled={settings.includeAiRemediationAppendix}
          onMasterChange={(value) =>
            setSettings((s) => ({ ...s, includeAiRemediationAppendix: value }))
          }
          candidates={aiCandidates}
          selectedIds={aiInclusionById}
          onToggleId={(id, included) =>
            setAiInclusionById((prev) => ({ ...prev, [id]: included }))
          }
          onBulk={(ids, included) =>
            setAiInclusionById((prev) => {
              const next = { ...prev };
              for (const id of ids) next[id] = included;
              return next;
            })
          }
        />

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={!canGenerate || busy}
            onClick={() => void generate()}
          >
            {previewReport ? "Regenerate report" : "Generate report preview"}
          </Button>
          {!canGenerate ? (
            <p className="text-sm text-muted">
              Run at least one preflight check (caption, contrast, AI, screen
              reader preview, or video captions) to generate a report.
            </p>
          ) : null}
        </div>

        {stale ? (
          <StatusMessage variant="review" title="Report may be stale">
            Content changed since this preview was generated. Regenerate the
            report before exporting.
          </StatusMessage>
        ) : null}

        {status ? (
          <p className="text-sm text-muted" aria-live="polite">
            {status}
          </p>
        ) : null}

        {displayReport ? (
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={handlePrint}>
              Print report
            </Button>
            <Button type="button" variant="secondary" onClick={() => void handlePdf()}>
              Download PDF
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                downloadReportJson(
                  displayReport,
                  sanitizeReportFilename(filenameBase, "json"),
                )
              }
            >
              Download JSON
            </Button>
            {displayReport.aiRemediationAppendix ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  downloadAiRemediationCsv(
                    displayReport.aiRemediationAppendix!.entries,
                    `${sanitizeReportFilename(filenameBase, "json").replace(/\.json$/i, "")}-ai-remediation.csv`,
                  )
                }
              >
                Download AI remediation CSV
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                downloadReportTextSummary(
                  displayReport,
                  sanitizeReportFilename(filenameBase, "txt"),
                )
              }
            >
              Download text summary
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void copyReportTextSummary(displayReport)}
            >
              Copy summary
            </Button>
            {pdfStatus ? (
              <p className="w-full text-sm text-muted" aria-live="polite">
                {pdfStatus}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {displayReport ? (
        <div className="mt-8 rounded-xl border border-border bg-background p-4 md:p-6">
          <ReportHtmlPreview report={displayReport} />
        </div>
      ) : null}
    </AppPanel>
  );
}
