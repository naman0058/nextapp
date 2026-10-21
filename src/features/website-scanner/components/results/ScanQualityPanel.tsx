import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import {
  aggregateEvidenceReporting,
  aggregatePageExecution,
  buildSiteScanDiagnostics,
  formatEvidenceReportingLabel,
  formatPageExecutionLabel,
} from "@/features/website-scanner/utils/pageScanDiagnostics";

type Props = { pages: WebsitePageScanResult[] };

export function ScanQualityPanel({ pages }: Props) {
  const diagnostics = buildSiteScanDiagnostics(pages);
  const pageExecution = aggregatePageExecution(pages);
  const evidenceReporting = aggregateEvidenceReporting(pages);

  return (
    <div className="space-y-2 text-sm">
      <p>
        Page execution:{" "}
        <strong>{formatPageExecutionLabel(pageExecution)}</strong>
      </p>
      <p>
        Evidence reporting:{" "}
        <strong>{formatEvidenceReportingLabel(evidenceReporting)}</strong>
        {evidenceReporting === "limited" &&
          diagnostics
            .flatMap((d) => d.evidenceReasons)
            .slice(0, 2)
            .map((reason) => (
              <span key={reason} className="block text-muted">
                {reason}
              </span>
            ))}
      </p>
      {diagnostics
        .flatMap((d) => d.executionReasons)
        .slice(0, 3)
        .map((reason) => (
          <p key={reason} className="text-muted">
            {reason}
          </p>
        ))}
    </div>
  );
}
