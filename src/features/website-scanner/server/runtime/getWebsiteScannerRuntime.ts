import "server-only";

import {
  getScannerRuntimeMode,
  getScannerServiceToken,
  getScannerServiceUrl,
} from "@/features/website-scanner/server/playwright/scannerConfig";
import { isLocalPlaywrightSupportedOnPlatform } from "@/features/website-scanner/server/config/scannerPlatform";
import { checkRemoteScannerHealth } from "@/features/website-scanner/server/runtime/checkRemoteScannerHealth";
import { RemoteScannerClient } from "@/features/website-scanner/server/runtime/remoteScannerClient";
import type { WebsiteScannerRuntime } from "@/features/website-scanner/server/runtime/types";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";

let localRuntime: WebsiteScannerRuntime | null = null;
let localRuntimePromise: Promise<WebsiteScannerRuntime> | null = null;
let remoteRuntime: RemoteScannerClient | null = null;

async function loadLocalRuntime(): Promise<WebsiteScannerRuntime> {
  if (localRuntime) return localRuntime;
  if (!localRuntimePromise) {
    localRuntimePromise = import(
      "@/features/website-scanner/server/runtime/localPlaywrightScanner"
    )
      .then((mod) => {
        localRuntime = new mod.LocalPlaywrightScanner();
        return localRuntime;
      })
      .catch(() => {
        localRuntimePromise = null;
        throw new WebsiteScanError(
          "SCANNER_UNAVAILABLE",
          "Local website scanning is unavailable on this host. Configure a remote scanner worker.",
        );
      });
  }
  return localRuntimePromise;
}

export async function getWebsiteScannerRuntime(): Promise<WebsiteScannerRuntime> {
  const mode = getScannerRuntimeMode();
  if (mode === "remote") {
    if (!getScannerServiceUrl() || !getScannerServiceToken()) {
      throw new WebsiteScanError(
        "SCANNER_UNAVAILABLE",
        "Website scanning is not configured.",
      );
    }
    void checkRemoteScannerHealth().then((ok) => {
      if (!ok) {
        console.warn("[scanner] Remote scanner health check failed.");
      }
    });
    if (!remoteRuntime) remoteRuntime = new RemoteScannerClient();
    return remoteRuntime;
  }

  if (!isLocalPlaywrightSupportedOnPlatform()) {
    throw new WebsiteScanError(
      "SCANNER_UNAVAILABLE",
      "Website scanning is temporarily unavailable. Other accessibility tools remain available.",
    );
  }

  return loadLocalRuntime();
}
