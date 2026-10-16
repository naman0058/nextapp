import { getSharedBrowser } from "@/features/website-scanner/server/playwright/browserPool";

const CACHE_TTL_MS = 60_000;

let cache: { at: number; ok: boolean } | null = null;
let inFlight: Promise<boolean> | null = null;

/** Test-only reset of readiness cache and in-flight probe. */
export function resetChromiumReadyState(): void {
  cache = null;
  inFlight = null;
}

async function probeChromiumReady(): Promise<boolean> {
  try {
    const browser = await getSharedBrowser();
    const ok = browser.isConnected();
    cache = { at: Date.now(), ok };
    return ok;
  } catch {
    cache = { at: Date.now(), ok: false };
    return false;
  } finally {
    inFlight = null;
  }
}

export async function checkChromiumReady(): Promise<boolean> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) {
    return cache.ok;
  }
  inFlight ??= probeChromiumReady();
  return inFlight;
}
