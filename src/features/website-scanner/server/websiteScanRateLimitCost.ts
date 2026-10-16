import type { ViewportScanMode } from "@/features/website-scanner/types/websiteDiscovery";

/** Weighted scan rate limit units (best-effort in-memory limiter; not distributed-safe). */
export function websiteScanPageRequestCost(siteBatch?: {
  pageTotal: number;
  viewportMode: ViewportScanMode;
}): number {
  if (!siteBatch) return 1;
  if (siteBatch.viewportMode === "compare") return 3;
  if (siteBatch.pageTotal > 1) return 2;
  return 1;
}

export const WEBSITE_DISCOVER_SITEMAP_RATE_COST = 2;
export const WEBSITE_DISCOVER_CRAWL_RATE_COST = 4;
export const WEBSITE_REGISTER_BATCH_RATE_COST = 1;
