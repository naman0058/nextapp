/**
 * @vitest-environment node
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

import { getWebsiteScannerAvailability } from "@/features/website-scanner/server/config/websiteScannerAvailability";
import { getWebsiteScannerRuntime } from "@/features/website-scanner/server/runtime/getWebsiteScannerRuntime";
const root = resolve(process.cwd());

function readSrc(relative: string): string {
  return readFileSync(resolve(root, relative), "utf8");
}

describe("scanner runtime import gate", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns remote runtime without loading local Playwright module", async () => {
    vi.stubEnv("SCANNER_RUNTIME", "remote");
    vi.stubEnv("SCANNER_SERVICE_URL", "https://scanner.example");
    vi.stubEnv("SCANNER_SERVICE_TOKEN", "test-token");
    vi.stubEnv("VERCEL", "");

    const runtime = await getWebsiteScannerRuntime();
    expect(runtime.constructor.name).toBe("RemoteScannerClient");
  });

  it("marks scanner unavailable on Vercel when local runtime is default", () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("SCANNER_RUNTIME", "");
    const availability = getWebsiteScannerAvailability();
    expect(availability.available).toBe(false);
    expect(availability.userMessage).toMatch(/unavailable/i);
  });

  it("rejects local runtime on Vercel before Playwright import", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("SCANNER_RUNTIME", "local");
    await expect(getWebsiteScannerRuntime()).rejects.toMatchObject({
      code: "SCANNER_UNAVAILABLE",
    });
  });

  it("homepage and layout do not reference Playwright", () => {
    for (const file of ["src/app/layout.tsx", "src/app/page.tsx", "src/app/icon.tsx"]) {
      const src = readSrc(file);
      expect(src).not.toMatch(/from ["']playwright["']/);
      expect(src).not.toMatch(/@axe-core\/playwright/);
    }
  });

  it("discover-crawl route does not statically import discoverCrawlUrls", () => {
    const src = readSrc("src/app/api/accessibility/website/discover-crawl/route.ts");
    expect(src).not.toMatch(
      /^import\s+\{\s*discoverCrawlUrls\s*\}/m,
    );
    expect(src).toContain('await import(');
  });

  it("throws SCANNER_UNAVAILABLE when local Playwright module fails to load", async () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("SCANNER_RUNTIME", "local");
    vi.doMock(
      "@/features/website-scanner/server/runtime/localPlaywrightScanner",
      () => {
        throw new Error("playwright missing");
      },
    );
    vi.resetModules();
    const { getWebsiteScannerRuntime: getRuntime } = await import(
      "@/features/website-scanner/server/runtime/getWebsiteScannerRuntime"
    );
    await expect(getRuntime()).rejects.toMatchObject({
      code: "SCANNER_UNAVAILABLE",
    });
  });
});
