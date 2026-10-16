import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { DeveloperTicketScanContext } from "@/features/website-scanner/developerTicket/types";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";

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

  let scanCompletenessNote: string | undefined;
  if (
    session.status === "partial" ||
    session.scanScope.pagesPartial > 0 ||
    session.scanScope.pagesFailed > 0
  ) {
    scanCompletenessNote =
      "Scan limitation: Some content may not have been fully evaluated.";
  }
  const anyLimited = completedPages.some(
    (p) =>
      p.scanCompleteness === "partial" ||
      p.scanCompleteness === "limited" ||
      p.scanQuality?.domTruncated ||
      p.scanQuality?.nodeEvidenceTruncated,
  );
  if (anyLimited && !scanCompletenessNote) {
    scanCompletenessNote =
      "Scan limitation: One or more pages had partial or limited evaluation.";
  }

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
