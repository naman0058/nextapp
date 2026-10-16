import type { Page } from "playwright";
import { MAX_DISCOVERED_LINKS_PER_PAGE } from "@/features/website-scanner/constants/scanLimits";
import {
  normalizeCrawlKey,
  shouldSkipCrawlHref,
} from "@/features/website-scanner/utils/crawl/normalizeCrawlUrl";

export async function discoverSameOriginLinks(
  page: Page,
  finalUrl: string,
): Promise<string[]> {
  const base = new URL(finalUrl);
  const hrefs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a[href]"))
      .map((a) => a.getAttribute("href"))
      .filter((h): h is string => Boolean(h));
  });

  const seen = new Set<string>();
  const out: string[] = [];

  for (const href of hrefs) {
    if (shouldSkipCrawlHref(href, base)) continue;
    let resolved: URL;
    try {
      resolved = new URL(href, base);
    } catch {
      continue;
    }
    if (resolved.origin !== base.origin) continue;
    const key = normalizeCrawlKey(resolved);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
    if (out.length >= MAX_DISCOVERED_LINKS_PER_PAGE) break;
  }

  return out;
}
