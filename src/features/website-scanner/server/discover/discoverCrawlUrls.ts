import {
  MAX_CRAWL_DEPTH,
  MAX_SITEMAP_DISCOVERED_URLS,
} from "@/features/website-scanner/constants/scanLimits";
import { getSharedBrowser } from "@/features/website-scanner/server/playwright/browserPool";
import {
  createIsolatedScanContext,
} from "@/features/website-scanner/server/playwright/pageScan";
import { discoverSameOriginLinks } from "@/features/website-scanner/server/playwright/discoverSameOriginLinks";
import { waitForDomainPoliteness } from "@/features/website-scanner/server/politeness";
import { validateScanTargetUrl } from "@/features/website-scanner/server/security/validateScanTarget";
import { safeCrawlKey } from "@/features/website-scanner/utils/crawl/safeCrawlKey";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";
import { withScanConcurrency } from "@/features/website-scanner/server/playwright/scanSemaphore";

export async function discoverCrawlUrls(
  startUrl: string,
): Promise<{ urls: { url: string; depth: number }[] }> {
  const validated = await validateScanTargetUrl(startUrl);
  const origin = new URL(validated.href).origin;
  return withScanConcurrency(async () => {
    const browser = await getSharedBrowser();
    const viewport = SCAN_VIEWPORTS.desktop;
    const context = await createIsolatedScanContext(browser, {
      width: viewport.width,
      height: viewport.height,
    });
    const found = new Map<string, { url: string; depth: number }>();
    const queue: { url: string; depth: number }[] = [
      { url: validated.href, depth: 0 },
    ];
    try {
      while (queue.length > 0 && found.size < MAX_SITEMAP_DISCOVERED_URLS) {
        const next = queue.shift()!;
        const key = safeCrawlKey(next.url);
        if (found.has(key)) continue;
        await waitForDomainPoliteness(new URL(next.url).hostname, {
          applyDelay: found.size > 0,
        });
        const page = await context.newPage();
        try {
          const response = await page.goto(next.url, {
            waitUntil: "domcontentloaded",
            timeout: 20_000,
          });
          const finalUrl = page.url();
          if (new URL(finalUrl).origin !== origin) continue;
          found.set(key, { url: finalUrl, depth: next.depth });
          if (next.depth >= MAX_CRAWL_DEPTH) continue;
          const links = await discoverSameOriginLinks(page, finalUrl);
          for (const link of links) {
            if (found.size + queue.length >= MAX_SITEMAP_DISCOVERED_URLS) break;
            const lk = safeCrawlKey(link);
            if (found.has(lk)) continue;
            queue.push({ url: link, depth: next.depth + 1 });
          }
          void response;
        } catch {
          /* skip unreachable page */
        } finally {
          await page.close().catch(() => undefined);
        }
      }
    } finally {
      await context.close().catch(() => undefined);
    }
    return { urls: [...found.values()] };
  });
}
