import "server-only";

import { getScannerRuntimeMode } from "@/features/website-scanner/server/playwright/scannerConfig";

/** Local Playwright must not run on Vercel/serverless frontends — use remote worker. */
export function isLocalPlaywrightSupportedOnPlatform(): boolean {
  if (getScannerRuntimeMode() !== "local") return false;
  if (process.env.VERCEL === "1" || process.env.VERCEL === "true") {
    return false;
  }
  return true;
}
