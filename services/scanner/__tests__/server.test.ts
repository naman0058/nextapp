import http from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifyScannerBearerToken } from "../auth";
import { createScannerHttpServer } from "../server";
import type { WebsiteScannerRuntime } from "@/features/website-scanner/server/runtime/types";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";

const TOKEN = "unit-test-scanner-token-32chars!!";

function minimalScanResult(): WebsitePageScanResult {
  return {
    requestedUrl: "https://example.com/",
    finalUrl: "https://example.com/",
    pageTitle: "Example",
    scannedAt: new Date().toISOString(),
    viewport: SCAN_VIEWPORTS.desktop,
    durationMs: 1,
    axeVersion: "test",
    scannerVersion: "test",
    summary: {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
      unknown: 0,
      incomplete: 0,
      bestPractice: 0,
    },
    violations: [],
    incomplete: [],
    passesCount: 0,
    inapplicableCount: 0,
    discoveredLinks: [],
    warnings: [],
    pageMetadata: {
      documentLang: null,
      domNodeCount: 0,
      internalLinkCount: 0,
      linkCount: 0,
      iframeCount: 0,
      formCount: 0,
      imageCount: 0,
      headingCount: 0,
      videoCount: 0,
      interactiveControlCount: 0,
      dialogHintCount: 0,
    },
  };
}

describe("verifyScannerBearerToken", () => {
  it("accepts matching Bearer token", () => {
    expect(
      verifyScannerBearerToken(`Bearer ${TOKEN}`, TOKEN),
    ).toBe(true);
  });

  it("rejects wrong token with same length", () => {
    const wrong = TOKEN.slice(0, -1) + (TOKEN.endsWith("a") ? "b" : "a");
    expect(verifyScannerBearerToken(`Bearer ${wrong}`, TOKEN)).toBe(false);
  });

  it("rejects missing Bearer prefix", () => {
    expect(verifyScannerBearerToken(TOKEN, TOKEN)).toBe(false);
  });
});

describe("createScannerHttpServer", () => {
  let server: http.Server;
  let port: number;
  let mockScanner: WebsiteScannerRuntime;

  beforeEach(async () => {
    mockScanner = {
      scanPage: vi.fn().mockResolvedValue(minimalScanResult()),
      discoverCrawlUrls: vi.fn().mockResolvedValue({
        urls: [{ url: "https://example.com/", depth: 0 }],
      }),
      visualizeIssue: vi.fn(),
    };
    server = createScannerHttpServer(mockScanner, TOKEN);
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });
    const addr = server.address();
    if (!addr || typeof addr === "string") throw new Error("no port");
    port = addr.port;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  function request(
    options: http.RequestOptions & { body?: string | Buffer },
  ): Promise<{ status: number; body: string }> {
    return new Promise((resolve, reject) => {
      const { body, ...rest } = options;
      const req = http.request(
        { host: "127.0.0.1", port, ...rest },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () =>
            resolve({
              status: res.statusCode ?? 0,
              body: Buffer.concat(chunks).toString("utf8"),
            }),
          );
        },
      );
      req.on("error", reject);
      if (body) req.end(body);
      else req.end();
    });
  }

  it("GET /health returns ok", async () => {
    const res = await request({ path: "/health", method: "GET" });
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body)).toMatchObject({
      ok: true,
      runtime: "playwright",
    });
  });

  it("POST /v1/scan-page returns 401 without auth", async () => {
    const res = await request({
      path: "/v1/scan-page",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com/" }),
    });
    expect(res.status).toBe(401);
  });

  it("POST /v1/scan-page returns 401 with invalid token", async () => {
    const res = await request({
      path: "/v1/scan-page",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer wrong-token",
      },
      body: JSON.stringify({ url: "https://example.com/" }),
    });
    expect(res.status).toBe(401);
  });

  it("POST /v1/scan-page returns 413 for oversized body", async () => {
    const huge = "x".repeat(256 * 1024 + 1);
    const res = await request({
      path: "/v1/scan-page",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ url: "https://example.com/", pad: huge }),
    });
    expect(res.status).toBe(413);
  });

  it("POST /v1/scan-page scans with valid auth", async () => {
    const res = await request({
      path: "/v1/scan-page",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        url: "https://example.com/",
        viewport: SCAN_VIEWPORTS.desktop,
      }),
    });
    expect(res.status).toBe(200);
    expect(mockScanner.scanPage).toHaveBeenCalledOnce();
  });

  it("maps SCANNER_UNAVAILABLE to 503", async () => {
    vi.mocked(mockScanner.scanPage).mockRejectedValueOnce(
      new WebsiteScanError("SCANNER_UNAVAILABLE", "Busy"),
    );
    const res = await request({
      path: "/v1/scan-page",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ url: "https://example.com/" }),
    });
    expect(res.status).toBe(503);
    expect(JSON.parse(res.body).code).toBe("SCANNER_UNAVAILABLE");
  });

  it("POST /v1/discover-crawl returns 401 without auth", async () => {
    const res = await request({
      path: "/v1/discover-crawl",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteUrl: "https://example.com/" }),
    });
    expect(res.status).toBe(401);
  });

  it("POST /v1/discover-crawl discovers with valid auth", async () => {
    const res = await request({
      path: "/v1/discover-crawl",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ siteUrl: "https://example.com/" }),
    });
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body).urls).toHaveLength(1);
    expect(mockScanner.discoverCrawlUrls).toHaveBeenCalledWith(
      "https://example.com/",
    );
  });
});
