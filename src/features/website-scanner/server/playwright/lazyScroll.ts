import type { Page } from "playwright";
import {
  MAX_SCROLL_STEPS,
  SCROLL_STEP_PAUSE_MS,
} from "@/features/website-scanner/constants/scanLimits";

export async function boundedLazyScroll(page: Page): Promise<void> {
  for (let i = 0; i < MAX_SCROLL_STEPS; i += 1) {
    await page.evaluate(() => {
      window.scrollBy(0, Math.max(200, window.innerHeight * 0.85));
    });
    await page.waitForTimeout(SCROLL_STEP_PAUSE_MS);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}
