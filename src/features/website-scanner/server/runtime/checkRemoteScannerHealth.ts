import {
  getScannerServiceToken,
  getScannerServiceUrl,
} from "@/features/website-scanner/server/playwright/scannerConfig";

let lastHealthOk: boolean | null = null;
let lastHealthAt = 0;
const HEALTH_TTL_MS = 30_000;

export async function checkRemoteScannerHealth(): Promise<boolean> {
  const base = getScannerServiceUrl();
  if (!base || !getScannerServiceToken()) return false;

  const now = Date.now();
  if (lastHealthOk !== null && now - lastHealthAt < HEALTH_TTL_MS) {
    return lastHealthOk;
  }

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5_000),
    });
    lastHealthOk = res.ok;
  } catch {
    lastHealthOk = false;
  }
  lastHealthAt = now;
  return lastHealthOk;
}
