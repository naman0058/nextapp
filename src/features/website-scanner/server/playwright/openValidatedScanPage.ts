import type { Page } from "playwright";
import {
  PAGE_NAVIGATION_TIMEOUT_MS,
  PAGE_SETTLE_MS,
  PAGE_TOTAL_SCAN_TIMEOUT_MS,
} from "@/features/website-scanner/constants/scanLimits";
import { boundedLazyScroll } from "@/features/website-scanner/server/playwright/lazyScroll";
import {
  attachNetworkGuard,
  type NetworkGuardState,
} from "@/features/website-scanner/server/playwright/networkGuard";
import { attachRedirectGuard } from "@/features/website-scanner/server/playwright/redirectGuard";
import { allowLoopbackForTests } from "@/features/website-scanner/server/security/testBypass";
import { validateScanTargetUrl } from "@/features/website-scanner/server/security/validateScanTarget";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";

function throwIfRedirectError(
  takeError: () => WebsiteScanError | null,
): void {
  const err = takeError();
  if (err) throw err;
}

export type OpenValidatedScanPageResult = {
  finalUrl: string;
  httpStatus?: number;
  loopbackFixture: boolean;
};

/** Shared bounded navigation for scan and visual locator (no axe). */
export async function openValidatedScanPage(
  page: Page,
  url: string,
  deadlineMs: number = PAGE_TOTAL_SCAN_TIMEOUT_MS,
): Promise<OpenValidatedScanPageResult> {
  const started = Date.now();
  const validated = await validateScanTargetUrl(url);
  const scanDeadline = started + deadlineMs;

  page.setDefaultTimeout(PAGE_NAVIGATION_TIMEOUT_MS);

  page.on("dialog", (d) => {
    void d.dismiss();
  });
  page.on("popup", (popup) => {
    void popup.close().catch(() => undefined);
  });

  const networkState: NetworkGuardState = { requestCount: 0, warnings: [] };
  const loopbackFixture = allowLoopbackForTests(validated.hostname);
  if (!loopbackFixture) {
    await attachNetworkGuard(page, networkState);
  }
  const useRedirectGuard = !loopbackFixture;
  const redirectGuard = useRedirectGuard ? attachRedirectGuard(page) : null;

  let httpStatus: number | undefined;
  let finalUrl = validated.href;

  const response = await page.goto(validated.href, {
    waitUntil: "domcontentloaded",
    timeout: PAGE_NAVIGATION_TIMEOUT_MS,
  });

  if (response) {
    httpStatus = response.status();
    finalUrl = response.url();
    await validateScanTargetUrl(finalUrl);
  }
  if (redirectGuard) {
    throwIfRedirectError(redirectGuard.takeError);
    await page.waitForTimeout(50);
    throwIfRedirectError(redirectGuard.takeError);
  }

  const remainingSettle = Math.min(PAGE_SETTLE_MS, scanDeadline - Date.now());
  if (remainingSettle > 0) {
    await page.waitForTimeout(remainingSettle);
  }

  if (!loopbackFixture) {
    await boundedLazyScroll(page);
  }

  if (Date.now() > scanDeadline) {
    throw new WebsiteScanError(
      "NAVIGATION_TIMEOUT",
      "This page took too long to load.",
    );
  }

  return { finalUrl, httpStatus, loopbackFixture };
}
