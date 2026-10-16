import http from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createScannerHttpServer } from "../../../../services/scanner/server";

const RUN = process.env.WEBSITE_SCANNER_INTEGRATION === "1";

describe.skipIf(!RUN)("scanner worker authentication", () => {
  let server: http.Server;
  let port: number;
  const token = "test-scanner-token-integration";

  beforeAll(async () => {
    process.env.SCANNER_SERVICE_TOKEN = token;
    server = createScannerHttpServer(undefined, token);
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });
    const addr = server.address();
    if (!addr || typeof addr === "string") throw new Error("no port");
    port = addr.port;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  async function postWithoutAuth(path: string, body: unknown): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const req = http.request(
        {
          host: "127.0.0.1",
          port,
          path,
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        (res) => {
          res.resume();
          resolve(res.statusCode ?? 0);
        },
      );
      req.on("error", reject);
      req.end(JSON.stringify(body));
    });
  }

  it("returns 401 without Bearer token on scan-page", async () => {
    const status = await postWithoutAuth("/v1/scan-page", {
      url: "https://example.com/",
    });
    expect(status).toBe(401);
  });

  it("returns 401 without Bearer token on discover-crawl", async () => {
    const status = await postWithoutAuth("/v1/discover-crawl", {
      siteUrl: "https://example.com/",
    });
    expect(status).toBe(401);
  });

  it("returns 401 without Bearer token on visualize-accessibility-issue", async () => {
    const status = await postWithoutAuth("/v1/visualize-accessibility-issue", {
      url: "https://example.com/",
      viewport: { id: "desktop", width: 1440, height: 900, label: "Desktop 1440 × 900" },
      ruleId: "button-name",
      target: ["button"],
      selectorLabel: "button",
      occurrenceIndex: 0,
      ruleTitle: "Buttons",
    });
    expect(status).toBe(401);
  });
});
