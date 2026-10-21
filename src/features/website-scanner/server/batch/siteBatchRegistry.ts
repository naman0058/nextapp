import {
  MAX_DUAL_VIEWPORT_PAGES,
  MAX_SITE_SCAN_PAGES,
  SITE_BATCH_REGISTRY_TTL_MS,
} from "@/features/website-scanner/constants/scanLimits";
import { validateSiteBatchTicket } from "@/features/website-scanner/server/batch/siteBatchTicket";
import { safeCrawlKey } from "@/features/website-scanner/utils/crawl/safeCrawlKey";

export type RegisteredSiteBatch = {
  batchId: string;
  origin: string;
  urls: string[];
  urlKeys: Set<string>;
  pageTotal: number;
  viewportMode: "desktop" | "mobile" | "compare";
  expiresAt: number;
};

const batches = new Map<string, RegisteredSiteBatch>();

function prune() {
  const now = Date.now();
  for (const [id, b] of batches.entries()) {
    if (b.expiresAt <= now) batches.delete(id);
  }
}

export function registerSiteBatch(input: {
  batchId: string;
  origin: string;
  urls: string[];
  viewportMode: "desktop" | "mobile" | "compare";
}): { ok: true; batch: RegisteredSiteBatch } | { ok: false; error: string } {
  prune();
  const unique = [...new Set(input.urls.map((u) => u.trim()).filter(Boolean))];
  if (unique.length === 0) {
    return { ok: false, error: "No URLs in batch." };
  }
  if (unique.length > MAX_SITE_SCAN_PAGES) {
    return {
      ok: false,
      error: `Batch exceeds maximum of ${MAX_SITE_SCAN_PAGES} pages.`,
    };
  }
  if (
    input.viewportMode === "compare" &&
    unique.length > MAX_DUAL_VIEWPORT_PAGES
  ) {
    return {
      ok: false,
      error: `Desktop + Mobile comparison supports up to ${MAX_DUAL_VIEWPORT_PAGES} pages.`,
    };
  }
  const batch: RegisteredSiteBatch = {
    batchId: input.batchId,
    origin: input.origin,
    urls: unique,
    urlKeys: new Set(unique.map((u) => safeCrawlKey(u))),
    pageTotal: unique.length,
    viewportMode: input.viewportMode,
    expiresAt: Date.now() + SITE_BATCH_REGISTRY_TTL_MS,
  };
  batches.set(input.batchId, batch);
  return { ok: true, batch };
}

export function validateBatchPageRequest(input: {
  batchId: string;
  url: string;
  pageIndex: number;
  pageTotal: number;
  viewportMode: "desktop" | "mobile" | "compare";
  batchTicket?: string | null;
}): { ok: true } | { ok: false; error: string } {
  if (input.batchTicket?.trim()) {
    return validateSiteBatchTicket({
      batchId: input.batchId,
      url: input.url,
      pageIndex: input.pageIndex,
      pageTotal: input.pageTotal,
      viewportMode: input.viewportMode,
      batchTicket: input.batchTicket,
    });
  }
  prune();
  const batch = batches.get(input.batchId);
  if (!batch) {
    return { ok: false, error: "Scan batch expired or unknown." };
  }
  if (input.pageTotal !== batch.pageTotal) {
    return { ok: false, error: "Batch page count mismatch." };
  }
  if (input.pageTotal > MAX_SITE_SCAN_PAGES) {
    return { ok: false, error: "Batch exceeds page limit." };
  }
  if (
    input.viewportMode === "compare" &&
    input.pageTotal > MAX_DUAL_VIEWPORT_PAGES
  ) {
    return { ok: false, error: "Dual viewport batch exceeds limit." };
  }
  if (input.pageIndex < 0 || input.pageIndex >= batch.pageTotal) {
    return { ok: false, error: "Invalid page index in batch." };
  }
  const key = safeCrawlKey(input.url);
  if (!batch.urlKeys.has(key)) {
    return { ok: false, error: "URL is not part of registered batch." };
  }
  return { ok: true };
}
