"use client";

import { useState } from "react";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { exportWebsiteFindingsCsv } from "@/features/website-scanner/utils/export/exportWebsiteFindingsCsv";
import {
  exportWebsitePageInventoryCsv,
  exportWebsiteRootCausesCsv,
} from "@/features/website-scanner/utils/export/exportWebsiteSupplementalCsv";
import { exportWebsiteScanJson } from "@/features/website-scanner/utils/export/exportWebsiteScanJson";
import {
  downloadBlob,
  exportWebsiteWorkbook,
} from "@/features/website-scanner/utils/export/exportWebsiteWorkbook";
import { buildEvidencePackageZip } from "@/features/website-scanner/utils/export/buildEvidencePackage";

type Props = {
  completedPages: WebsitePageScanResult[];
  onRescan: () => void;
};

export function WebsiteExportMenu({ completedPages, onRescan }: Props) {
  const { state } = useWebsiteScanSession();
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function runExport(label: string, fn: () => Promise<void>) {
    setBusy(true);
    setStatus(label);
    try {
      await fn();
      setStatus(`${label} — ready`);
    } catch {
      setStatus(`${label} failed — try CSV or JSON`);
    } finally {
      setBusy(false);
      setTimeout(() => setStatus(null), 3000);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="rounded-lg border border-border px-3 py-1.5 text-sm"
        onClick={() => onRescan()}
        disabled={busy}
      >
        Rescan
      </button>
      <details className="relative">
        <summary className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-sm font-medium">
          Export
        </summary>
        <div className="absolute z-10 mt-1 min-w-[12rem] rounded-lg border border-border bg-card p-2 shadow-lg">
          <button
            type="button"
            className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
            disabled={busy}
            onClick={() =>
              void runExport("Preparing Excel workbook", async () => {
                const blob = await exportWebsiteWorkbook(state, completedPages);
                downloadBlob(blob, "accessibility-preflight.xlsx");
              })
            }
          >
            Excel workbook (.xlsx)
          </button>
          <button
            type="button"
            className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
            disabled={busy}
            onClick={() =>
              exportWebsiteFindingsCsv(completedPages, state.siteIntelligence)
            }
          >
            CSV — findings detail
          </button>
          <button
            type="button"
            className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
            disabled={busy}
            onClick={() => exportWebsitePageInventoryCsv(state)}
          >
            CSV — page inventory
          </button>
          <button
            type="button"
            className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
            disabled={busy}
            onClick={() => exportWebsiteRootCausesCsv(state.siteIntelligence)}
          >
            CSV — root causes
          </button>
          <button
            type="button"
            className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
            disabled={busy}
            onClick={() => exportWebsiteScanJson(state)}
          >
            JSON data
          </button>
          <button
            type="button"
            className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
            disabled={busy}
            onClick={() =>
              void runExport("Preparing evidence package", async () => {
                const blob = await buildEvidencePackageZip(state, completedPages);
                downloadBlob(blob, "accessibility-evidence.zip");
              })
            }
          >
            Evidence package (ZIP)
          </button>
          <p className="mt-2 border-t border-border pt-2 text-xs text-muted">
            Use Report tab for PDF preview / print.
          </p>
        </div>
      </details>
      {status && (
        <span className="text-xs text-muted" role="status">
          {status}
        </span>
      )}
    </div>
  );
}
