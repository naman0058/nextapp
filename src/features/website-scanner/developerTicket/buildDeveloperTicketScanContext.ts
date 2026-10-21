import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { DeveloperTicketScanContext } from "@/features/website-scanner/developerTicket/types";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";
import {
  aggregateEvidenceReporting,
  aggregatePageExecution,
  buildSiteScanDiagnostics,
  formatEvidenceReportingLabel,
  formatPageExecutionLabel,
} from "@/features/website-scanner/utils/pageScanDiagnostics";

export function buildDeveloperTicketScanContext(
  session: Pick<
    WebsiteScanSessionState,
    "rootUrl" | "completedAt" | "viewportMode" | "status" | "scanScope"
  >,
  completedPages: WebsitePageScanResult[],
  verificationStatus?: string,
  verificationOccurrenceDelta?: string,
): DeveloperTicketScanContext {
  let viewportLabel = SCAN_VIEWPORTS.desktop.label;
  if (session.viewportMode === "mobile") {
    viewportLabel = SCAN_VIEWPORTS.mobile.label;
  } else if (session.viewportMode === "compare") {
    viewportLabel = "Desktop + Mobile (compare)";
  } else if (completedPages[0]?.viewport.label) {
    viewportLabel = completedPages[0].viewport.label;
  }

  const noteParts: string[] = [];
  if (
    session.status === "partial" ||
    session.scanScope.pagesPartial > 0 ||
    session.scanScope.pagesFailed > 0
  ) {
    if (session.scanScope.pagesFailed > 0) {
      noteParts.push(
        `Scan scope: ${session.scanScope.pagesFailed} page(s) failed to scan.`,
      );
    }
    if (session.scanScope.pagesPartial > 0) {
      noteParts.push(
        `Scan scope: ${session.scanScope.pagesPartial} page(s) completed with partial execution.`,
      );
    }
    if (noteParts.length === 0) {
      noteParts.push("Scan scope: Not all selected pages completed.");
    }
  }

  const pageExecution = aggregatePageExecution(completedPages);
  const evidenceReporting = aggregateEvidenceReporting(completedPages);
  const diagnostics = buildSiteScanDiagnostics(completedPages);
  const executionReasons = diagnostics.flatMap((d) => d.executionReasons);
  const evidenceReasons = diagnostics.flatMap((d) => d.evidenceReasons);

  if (pageExecution !== "complete") {
    noteParts.push(
      `Page execution: ${formatPageExecutionLabel(pageExecution)}${
        executionReasons.length ? ` — ${executionReasons.join("; ")}` : ""
      }.`,
    );
  }
  if (evidenceReporting === "limited") {
    noteParts.push(
      `Evidence reporting: ${formatEvidenceReportingLabel(evidenceReporting)}${
        evidenceReasons.length ? ` — ${evidenceReasons.join("; ")}` : ""
      }.`,
    );
  }

  const scanCompletenessNote =
    noteParts.length > 0 ? noteParts.join(" ") : undefined;

  let origin: string | undefined;
  try {
    origin = new URL(session.rootUrl).origin;
  } catch {
    origin = undefined;
  }

  const axeVersion = completedPages.find((p) => p.axeVersion)?.axeVersion;

  return {
    scannedOrigin: origin,
    viewportLabel,
    scanCompletedAt: session.completedAt ?? undefined,
    scanCompletenessNote,
    axeVersion,
    verificationStatus,
    verificationOccurrenceDelta,
    visualLocatorNote: "Visual evidence is available in the current scan session (View on Page).",
  };
}
