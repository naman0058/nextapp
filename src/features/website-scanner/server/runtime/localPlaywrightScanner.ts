import { getSharedBrowser } from "@/features/website-scanner/server/playwright/browserPool";
import {
  createIsolatedScanContext,
  scanPageInContext,
} from "@/features/website-scanner/server/playwright/pageScan";
import { withScanConcurrency } from "@/features/website-scanner/server/playwright/scanSemaphore";
import { visualizeIssueInContext } from "@/features/website-scanner/server/visualLocator/visualizeIssueInContext";
import type { WebsiteScannerRuntime } from "@/features/website-scanner/server/runtime/types";
import type {
  WebsitePageScanRequest,
  WebsitePageScanResult,
} from "@/features/website-scanner/types/scanTypes";
import type {
  WebsiteVisualLocatorRequest,
  WebsiteVisualLocatorResult,
} from "@/features/website-scanner/types/visualLocator";

export class LocalPlaywrightScanner implements WebsiteScannerRuntime {
  async scanPage(
    request: WebsitePageScanRequest,
  ): Promise<WebsitePageScanResult> {
    return withScanConcurrency(async () => {
      const browser = await getSharedBrowser();
      const context = await createIsolatedScanContext(browser, {
        width: request.viewport.width,
        height: request.viewport.height,
      });
      try {
        return await scanPageInContext(context, request);
      } finally {
        await context.close().catch(() => undefined);
      }
    });
  }

  async visualizeIssue(
    request: WebsiteVisualLocatorRequest,
  ): Promise<WebsiteVisualLocatorResult> {
    return withScanConcurrency(async () => {
      const browser = await getSharedBrowser();
      const context = await createIsolatedScanContext(browser, {
        width: request.viewport.width,
        height: request.viewport.height,
      });
      try {
        return await visualizeIssueInContext(context, request);
      } finally {
        await context.close().catch(() => undefined);
      }
    });
  }
}
