import {
  MAX_DUAL_VIEWPORT_PAGES,
  MAX_SITE_SCAN_PAGES,
} from "@/features/website-scanner/constants/scanLimits";
import {
  SCAN_VIEWPORTS,
  type ScanViewportId,
} from "@/features/website-scanner/constants/viewports";
import { validateBatchPageRequest } from "@/features/website-scanner/server/batch/siteBatchRegistry";
import type { WebsiteScanMode } from "@/features/website-scanner/types/scanTypes";
import type { ViewportScanMode } from "@/features/website-scanner/types/websiteDiscovery";

export type ParsedScanPageRequest = {
  url: string;
  viewportId: ScanViewportId;
  mode: WebsiteScanMode;
  rootOrigin: string | null;
  includeBestPractices: boolean;
  applyPolitenessDelay: boolean;
  siteBatch: {
    batchId: string;
    pageIndex: number;
    pageTotal: number;
    viewportMode: ViewportScanMode;
    batchTicket: string | null;
  } | null;
};

const MAX_URL_LENGTH = 2048;

export function parseScanPageRequestBody(
  body: unknown,
): ParsedScanPageRequest | { error: string; status: number } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body.", status: 400 };
  }
  const record = body as Record<string, unknown>;
  const url = typeof record.url === "string" ? record.url.trim() : "";
  if (!url || url.length > MAX_URL_LENGTH) {
    return { error: "Enter a valid website URL.", status: 400 };
  }

  const viewportRaw =
    typeof record.viewport === "string" ? record.viewport : "desktop";
  const viewportId =
    viewportRaw === "mobile" ? "mobile" : ("desktop" as ScanViewportId);
  if (!SCAN_VIEWPORTS[viewportId]) {
    return { error: "Unsupported viewport.", status: 400 };
  }

  const modeRaw = typeof record.mode === "string" ? record.mode : "single_page";
  const mode: WebsiteScanMode =
    modeRaw === "small_site" ? "small_site" : "single_page";

  let rootOrigin: string | null = null;
  if (typeof record.rootOrigin === "string" && record.rootOrigin.trim()) {
    try {
      rootOrigin = new URL(record.rootOrigin.trim()).origin;
    } catch {
      return { error: "Invalid crawl origin.", status: 400 };
    }
  }

  const includeBestPractices =
    record.includeBestPractices === undefined
      ? true
      : Boolean(record.includeBestPractices);

  let siteBatch: ParsedScanPageRequest["siteBatch"] = null;
  const batchRaw = record.siteBatch;
  if (batchRaw && typeof batchRaw === "object") {
    const b = batchRaw as Record<string, unknown>;
    const batchId = typeof b.batchId === "string" ? b.batchId : "";
    const pageIndex = typeof b.pageIndex === "number" ? b.pageIndex : -1;
    const pageTotal = typeof b.pageTotal === "number" ? b.pageTotal : 0;
    const viewportMode: ViewportScanMode =
      b.viewportMode === "compare" || b.viewportMode === "mobile"
        ? b.viewportMode
        : "desktop";
    const batchTicket =
      typeof b.batchTicket === "string" && b.batchTicket.trim()
        ? b.batchTicket.trim()
        : null;
    if (!batchId || pageTotal <= 0) {
      return { error: "Invalid batch metadata.", status: 400 };
    }
    if (pageTotal > MAX_SITE_SCAN_PAGES) {
      return {
        error: `Site scan exceeds ${MAX_SITE_SCAN_PAGES} pages.`,
        status: 400,
      };
    }
    if (viewportMode === "compare" && pageTotal > MAX_DUAL_VIEWPORT_PAGES) {
      return {
        error: `Desktop + Mobile comparison supports up to ${MAX_DUAL_VIEWPORT_PAGES} pages.`,
        status: 400,
      };
    }
    const v = validateBatchPageRequest({
      batchId,
      url,
      pageIndex,
      pageTotal,
      viewportMode,
      batchTicket,
    });
    if (!v.ok) {
      return { error: v.error, status: 403 };
    }
    siteBatch = { batchId, pageIndex, pageTotal, viewportMode, batchTicket };
  }

  const applyPolitenessDelay =
    siteBatch !== null
      ? siteBatch.pageTotal > 1 ||
        siteBatch.viewportMode === "compare"
      : mode === "small_site";

  return {
    url,
    viewportId,
    mode,
    rootOrigin,
    includeBestPractices,
    applyPolitenessDelay: siteBatch ? true : applyPolitenessDelay,
    siteBatch,
  };
}
