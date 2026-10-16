import robotsParser from "robots-parser";
import {
  ROBOTS_CACHE_TTL_MS,
  ROBOTS_FETCH_TIMEOUT_MS,
} from "@/features/website-scanner/constants/scanLimits";
import { validateScanTargetUrl } from "@/features/website-scanner/server/security/validateScanTarget";
import { getScannerUserAgent } from "@/features/website-scanner/server/playwright/scannerConfig";

type CacheEntry = {
  parser: ReturnType<typeof robotsParser>;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

export async function isUrlAllowedByRobots(
  pageUrl: string,
): Promise<boolean> {
  let origin: URL;
  try {
    origin = new URL(pageUrl);
  } catch {
    return false;
  }
  const robotsUrl = `${origin.origin}/robots.txt`;
  const cacheKey = origin.origin;
  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.parser.isAllowed(pageUrl, getScannerUserAgent()) ?? true;
  }

  try {
    await validateScanTargetUrl(robotsUrl);
  } catch {
    return true;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ROBOTS_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(robotsUrl, {
      signal: controller.signal,
      headers: { "User-Agent": getScannerUserAgent() },
    });
    const body = res.ok ? await res.text() : "";
    const parser = robotsParser(robotsUrl, body);
    cache.set(cacheKey, {
      parser,
      expiresAt: now + ROBOTS_CACHE_TTL_MS,
    });
    return parser.isAllowed(pageUrl, getScannerUserAgent()) ?? true;
  } catch {
    return true;
  } finally {
    clearTimeout(timer);
  }
}
