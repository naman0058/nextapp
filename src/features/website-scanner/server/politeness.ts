import { SITE_CRAWL_DELAY_MS } from "@/features/website-scanner/constants/scanLimits";

const lastScanByHost = new Map<string, number>();

export async function waitForDomainPoliteness(
  hostname: string,
  options?: { applyDelay?: boolean },
): Promise<void> {
  if (options?.applyDelay === false) return;
  const key = hostname.toLowerCase();
  const last = lastScanByHost.get(key) ?? 0;
  const elapsed = Date.now() - last;
  if (elapsed < SITE_CRAWL_DELAY_MS) {
    await new Promise((r) => setTimeout(r, SITE_CRAWL_DELAY_MS - elapsed));
  }
  lastScanByHost.set(key, Date.now());
}

export function sanitizeUrlForLog(url: string): string {
  try {
    const u = new URL(url);
    u.search = "";
    u.hash = "";
    return u.href;
  } catch {
    return "[invalid-url]";
  }
}
