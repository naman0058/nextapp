import { chromium, type Browser } from "playwright";

let browserPromise: Promise<Browser> | null = null;

export async function getSharedBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
    });
  }
  try {
    const browser = await browserPromise;
    if (!browser.isConnected()) {
      browserPromise = chromium.launch({ headless: true });
      return browserPromise;
    }
    return browser;
  } catch {
    browserPromise = chromium.launch({ headless: true });
    return browserPromise;
  }
}

export async function closeSharedBrowser(): Promise<void> {
  if (browserPromise) {
    const b = await browserPromise;
    browserPromise = null;
    await b.close().catch(() => undefined);
  }
}
