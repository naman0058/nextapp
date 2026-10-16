import { MAX_SITEMAP_DOWNLOAD_BYTES } from "@/features/website-scanner/constants/scanLimits";
import { getScannerUserAgent } from "@/features/website-scanner/server/playwright/scannerConfig";
import { validateScanTargetUrl } from "@/features/website-scanner/server/security/validateScanTarget";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";

export async function fetchSitemapSecure(sitemapUrl: string): Promise<string> {
  if (/\.gz($|\?)/i.test(sitemapUrl)) {
    throw new WebsiteScanError(
      "SITEMAP_UNSUPPORTED",
      "Compressed sitemap files (.xml.gz) are not supported yet.",
    );
  }
  const validated = await validateScanTargetUrl(sitemapUrl);
  let currentUrl = validated.href;
  for (let redirects = 0; redirects < 5; redirects++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    try {
      const res = await fetch(currentUrl, {
        signal: controller.signal,
        redirect: "manual",
        headers: { "User-Agent": getScannerUserAgent() },
      });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        if (!loc) break;
        const next = new URL(loc, currentUrl).href;
        await validateScanTargetUrl(next);
        currentUrl = next;
        continue;
      }
      if (!res.ok) {
        throw new WebsiteScanError(
          "SITEMAP_FETCH_FAILED",
          `Could not fetch sitemap (HTTP ${res.status}).`,
        );
      }
      const buf = await res.arrayBuffer();
      if (buf.byteLength > MAX_SITEMAP_DOWNLOAD_BYTES) {
        throw new WebsiteScanError(
          "SITEMAP_TOO_LARGE",
          "Sitemap exceeds the maximum allowed download size.",
        );
      }
      const text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
      const ct = res.headers.get("content-type") ?? "";
      if (
        !ct.includes("xml") &&
        !ct.includes("text/plain") &&
        !text.trimStart().startsWith("<")
      ) {
        throw new WebsiteScanError(
          "SITEMAP_INVALID",
          "Sitemap response is not XML.",
        );
      }
      return text;
    } finally {
      clearTimeout(timer);
    }
  }
  throw new WebsiteScanError(
    "SITEMAP_FETCH_FAILED",
    "Too many redirects while fetching sitemap.",
  );
}
