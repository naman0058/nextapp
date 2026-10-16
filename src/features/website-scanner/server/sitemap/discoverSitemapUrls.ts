import {
  MAX_SITEMAP_DISCOVERED_URLS,
  MAX_SITEMAP_INDEX_DEPTH,
  MAX_SITEMAP_INDEX_FILES,
} from "@/features/website-scanner/constants/scanLimits";
import { fetchSitemapSecure } from "@/features/website-scanner/server/sitemap/fetchSitemapSecure";
import { filterSameOriginLocs } from "@/features/website-scanner/server/sitemap/filterSitemapLocs";
import { parseSitemapXml } from "@/features/website-scanner/server/sitemap/parseSitemapXml";
import { validateScanTargetUrl } from "@/features/website-scanner/server/security/validateScanTarget";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";
import { getScannerUserAgent } from "@/features/website-scanner/server/playwright/scannerConfig";

export type SitemapDiscoveryResult = {
  urls: { url: string; lastModified?: string | null }[];
  externalUrlsIgnored: number;
  sitemapSourcesUsed: string[];
};

export async function extractRobotsSitemapUrls(origin: string): Promise<string[]> {
  const robotsUrl = `${origin}/robots.txt`;
  try {
    await validateScanTargetUrl(robotsUrl);
  } catch {
    return [];
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const res = await fetch(robotsUrl, {
      signal: controller.signal,
      headers: { "User-Agent": getScannerUserAgent() },
    });
    if (!res.ok) return [];
    const body = await res.text();
    const urls: string[] = [];
    for (const line of body.split("\n")) {
      const m = line.match(/^\s*sitemap:\s*(.+)\s*$/i);
      if (!m?.[1]) continue;
      try {
        const u = new URL(m[1].trim());
        if (u.origin === origin) urls.push(u.href);
      } catch {
        /* ignore */
      }
    }
    return urls;
  } finally {
    clearTimeout(timer);
  }
}

async function walkSitemap(
  sitemapUrl: string,
  reviewOrigin: string,
  visited: Set<string>,
  depth: number,
  filesFetched: { count: number },
  acc: { url: string; lastModified?: string | null }[],
  externalTotal: { count: number },
): Promise<void> {
  if (acc.length >= MAX_SITEMAP_DISCOVERED_URLS) return;
  if (depth > MAX_SITEMAP_INDEX_DEPTH) return;
  if (filesFetched.count >= MAX_SITEMAP_INDEX_FILES) return;
  if (visited.has(sitemapUrl)) return;
  visited.add(sitemapUrl);
  filesFetched.count += 1;
  const xml = await fetchSitemapSecure(sitemapUrl);
  const parsed = parseSitemapXml(xml);
  if (parsed.type === "urlset") {
    const { accepted, externalIgnored } = filterSameOriginLocs(
      parsed.urls,
      reviewOrigin,
    );
    externalTotal.count += externalIgnored;
    for (const u of accepted) {
      if (acc.length >= MAX_SITEMAP_DISCOVERED_URLS) break;
      acc.push({ url: u.loc, lastModified: u.lastmod ?? null });
    }
    return;
  }
  for (const child of parsed.childSitemapUrls) {
    if (acc.length >= MAX_SITEMAP_DISCOVERED_URLS) break;
    try {
      const childUrl = new URL(child, sitemapUrl).href;
      if (new URL(childUrl).origin !== reviewOrigin) {
        externalTotal.count += 1;
        continue;
      }
      await walkSitemap(
        childUrl,
        reviewOrigin,
        visited,
        depth + 1,
        filesFetched,
        acc,
        externalTotal,
      );
    } catch {
      externalTotal.count += 1;
    }
  }
}

export async function discoverSitemapUrls(input: {
  siteUrl: string;
  manualSitemapUrl?: string | null;
}): Promise<SitemapDiscoveryResult> {
  const validated = await validateScanTargetUrl(input.siteUrl);
  const origin = new URL(validated.href).origin;
  const candidates = new Set<string>();
  if (input.manualSitemapUrl?.trim()) {
    const manual = await validateScanTargetUrl(input.manualSitemapUrl.trim());
    if (new URL(manual.href).origin !== origin) {
      throw new WebsiteScanError(
        "SITEMAP_INVALID",
        "Sitemap URL must be on the same website origin as the review target.",
      );
    }
    candidates.add(manual.href);
  } else {
    for (const u of await extractRobotsSitemapUrls(origin)) {
      candidates.add(u);
    }
    candidates.add(`${origin}/sitemap.xml`);
  }
  const acc: { url: string; lastModified?: string | null }[] = [];
  const visited = new Set<string>();
  const externalTotal = { count: 0 };
  const sourcesUsed: string[] = [];
  for (const sitemapUrl of candidates) {
    if (acc.length >= MAX_SITEMAP_DISCOVERED_URLS) break;
    try {
      sourcesUsed.push(sitemapUrl);
      await walkSitemap(
        sitemapUrl,
        origin,
        visited,
        0,
        { count: 0 },
        acc,
        externalTotal,
      );
    } catch (err) {
      if (err instanceof WebsiteScanError && err.code === "SITEMAP_UNSUPPORTED") {
        throw err;
      }
      /* try next candidate */
    }
  }
  if (acc.length === 0 && sourcesUsed.length === 0) {
    throw new WebsiteScanError(
      "SITEMAP_NOT_FOUND",
      "No sitemap could be loaded for this website.",
    );
  }
  const dedup = new Map<string, { url: string; lastModified?: string | null }>();
  for (const u of acc) dedup.set(u.url, u);
  return {
    urls: [...dedup.values()],
    externalUrlsIgnored: externalTotal.count,
    sitemapSourcesUsed: sourcesUsed,
  };
}
