/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("remote crawl discovery", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("RemoteScannerClient calls worker /v1/discover-crawl", async () => {
    vi.stubEnv("SCANNER_RUNTIME", "remote");
    vi.stubEnv("SCANNER_SERVICE_URL", "https://scanner.example");
    vi.stubEnv("SCANNER_SERVICE_TOKEN", "remote-token");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        urls: [
          { url: "https://example.com/", depth: 0 },
          { url: "https://example.com/about", depth: 1 },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { RemoteScannerClient } = await import(
      "@/features/website-scanner/server/runtime/remoteScannerClient"
    );
    const client = new RemoteScannerClient();
    const result = await client.discoverCrawlUrls("https://example.com/");

    expect(result.urls).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://scanner.example/v1/discover-crawl");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      Authorization: "Bearer remote-token",
    });
    expect(JSON.parse(String(init.body))).toEqual({
      siteUrl: "https://example.com/",
    });
  });

  it("remote crawl failure does not load local Playwright module", async () => {
    vi.stubEnv("SCANNER_RUNTIME", "remote");
    vi.stubEnv("SCANNER_SERVICE_URL", "https://scanner.example");
    vi.stubEnv("SCANNER_SERVICE_TOKEN", "remote-token");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({
          code: "SCANNER_UNAVAILABLE",
          error: "Busy",
        }),
      }),
    );

    vi.doMock(
      "@/features/website-scanner/server/runtime/localPlaywrightScanner",
      () => {
        throw new Error("playwright must not load on remote crawl failure");
      },
    );

    const { getWebsiteScannerRuntime } = await import(
      "@/features/website-scanner/server/runtime/getWebsiteScannerRuntime"
    );
    const runtime = await getWebsiteScannerRuntime();
    await expect(runtime.discoverCrawlUrls("https://example.com/")).rejects.toMatchObject({
      code: "SCANNER_UNAVAILABLE",
    });
  });

  it("discover-crawl API route has no Playwright crawl import", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const src = readFileSync(
      resolve(process.cwd(), "src/app/api/accessibility/website/discover-crawl/route.ts"),
      "utf8",
    );
    expect(src).not.toMatch(/playwright/);
    expect(src).not.toMatch(/discover\/discoverCrawlUrls/);
    expect(src).toContain("getWebsiteScannerRuntime");
  });
});
