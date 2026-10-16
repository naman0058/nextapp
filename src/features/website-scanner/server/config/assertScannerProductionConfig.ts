import "server-only";

import {
  getScannerRuntimeMode,
  getScannerServiceToken,
  getScannerServiceUrl,
} from "@/features/website-scanner/server/playwright/scannerConfig";
import { assertLoopbackBypassDisabledInProduction } from "@/features/website-scanner/server/security/testBypass";
import { assertVisualLocatorProductionConfig } from "@/features/website-scanner/server/config/assertVisualLocatorConfig";

let warnedLocalInProduction = false;

/**
 * Warn or fail when production is misconfigured for website scanning.
 */
export function assertScannerProductionConfig(): void {
  assertLoopbackBypassDisabledInProduction();
  assertVisualLocatorProductionConfig();
  if (process.env.NODE_ENV !== "production") return;

  const mode = getScannerRuntimeMode();
  if (mode === "remote") {
    if (!getScannerServiceUrl() || !getScannerServiceToken()) {
      throw new Error(
        "[scanner] SCANNER_RUNTIME=remote requires SCANNER_SERVICE_URL and SCANNER_SERVICE_TOKEN in production.",
      );
    }
    return;
  }

  if (!warnedLocalInProduction) {
    warnedLocalInProduction = true;
    console.warn(
      "[scanner] SCANNER_RUNTIME=local in production: ensure this host can run Playwright Chromium safely with network egress controls. Prefer remote worker on serverless.",
    );
  }
}
