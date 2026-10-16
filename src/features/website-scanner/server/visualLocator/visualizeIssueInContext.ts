import type { BrowserContext } from "playwright";
import {
  MAX_VISUAL_LOCATOR_IMAGE_BYTES,
  VISUAL_LOCATOR_SCREENSHOT_QUALITY,
  VISUAL_LOCATOR_TIMEOUT_MS,
} from "@/features/website-scanner/constants/visualLocatorLimits";
import { openValidatedScanPage } from "@/features/website-scanner/server/playwright/openValidatedScanPage";
import { injectVisualOverlay } from "@/features/website-scanner/server/visualLocator/injectVisualOverlay";
import { resolveAxeTargetOnPage } from "@/features/website-scanner/server/visualLocator/resolveAxeTargetOnPage";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";
import type {
  WebsiteVisualLocatorRequest,
  WebsiteVisualLocatorResult,
} from "@/features/website-scanner/types/visualLocator";

async function captureWithinBudget(
  page: import("playwright").Page,
): Promise<{ buffer: Buffer; contentType: "image/webp" | "image/png" }> {
  let quality = VISUAL_LOCATOR_SCREENSHOT_QUALITY;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const buffer = await page.screenshot({
      type: "webp",
      quality,
      fullPage: false,
      animations: "disabled",
    });
    if (buffer.length <= MAX_VISUAL_LOCATOR_IMAGE_BYTES) {
      return { buffer, contentType: "image/webp" };
    }
    quality = Math.max(50, quality - 15);
  }
  const png = await page.screenshot({
    type: "png",
    fullPage: false,
    animations: "disabled",
  });
  if (png.length > MAX_VISUAL_LOCATOR_IMAGE_BYTES) {
    throw new WebsiteScanError(
      "BROWSER_ERROR",
      "Visual evidence image exceeded size limits.",
    );
  }
  return { buffer: png, contentType: "image/png" };
}

export async function visualizeIssueInContext(
  context: BrowserContext,
  request: WebsiteVisualLocatorRequest,
): Promise<WebsiteVisualLocatorResult> {
  const page = await context.newPage();
  try {
    await openValidatedScanPage(page, request.url, VISUAL_LOCATOR_TIMEOUT_MS);
    const { locator, match } = await resolveAxeTargetOnPage(
      page,
      request.target,
      request.selectorLabel,
    );
    await injectVisualOverlay(locator, {
      occurrenceIndex: request.occurrenceIndex,
      label: request.ruleTitle,
    });
    const { buffer, contentType } = await captureWithinBudget(page);
    return {
      image: buffer,
      contentType,
      match,
      occurrenceIndex: request.occurrenceIndex,
    };
  } catch (err) {
    if (err instanceof WebsiteScanError) throw err;
    const message = err instanceof Error ? err.message : "Visual location failed.";
    if (message.toLowerCase().includes("timeout")) {
      throw new WebsiteScanError(
        "NAVIGATION_TIMEOUT",
        "This page took too long to render for visual location.",
      );
    }
    throw new WebsiteScanError("BROWSER_ERROR", "Could not generate visual location.");
  } finally {
    await page.close().catch(() => undefined);
  }
}
