import type { WebsitePageEntry } from "@/features/website-scanner/types/websiteSession";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

/** Flatten page entries into scan results for S1 intelligence (includes both viewports in compare mode). */
export function collectPageScanResults(
  pages: WebsitePageEntry[],
): WebsitePageScanResult[] {
  const out: WebsitePageScanResult[] = [];
  for (const p of pages) {
    if (p.status !== "complete") continue;
    if (p.desktopResult) out.push(p.desktopResult);
    if (p.mobileResult) out.push(p.mobileResult);
    if (p.result && !p.desktopResult && !p.mobileResult) {
      out.push(p.result);
    }
  }
  return out;
}
