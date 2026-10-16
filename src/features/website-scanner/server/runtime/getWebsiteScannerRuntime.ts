import "server-only";

import {
  getScannerRuntimeMode,
  getScannerServiceToken,
  getScannerServiceUrl,
} from "@/features/website-scanner/server/playwright/scannerConfig";
import { checkRemoteScannerHealth } from "@/features/website-scanner/server/runtime/checkRemoteScannerHealth";
import { LocalPlaywrightScanner } from "@/features/website-scanner/server/runtime/localPlaywrightScanner";
import { RemoteScannerClient } from "@/features/website-scanner/server/runtime/remoteScannerClient";
import type { WebsiteScannerRuntime } from "@/features/website-scanner/server/runtime/types";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";

let localRuntime: LocalPlaywrightScanner | null = null;
let remoteRuntime: RemoteScannerClient | null = null;

export function getWebsiteScannerRuntime(): WebsiteScannerRuntime {
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
  if (!localRuntime) localRuntime = new LocalPlaywrightScanner();
  return localRuntime;
}
