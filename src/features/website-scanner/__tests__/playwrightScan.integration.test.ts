import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { LocalPlaywrightScanner } from "@/features/website-scanner/server/runtime/localPlaywrightScanner";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";
import { WEBSITE_SCANNER_INTEGRATION_ENABLED } from "./integrationEnv";

describe.skipIf(!WEBSITE_SCANNER_INTEGRATION_ENABLED)(
  "LocalPlaywrightScanner integration",
  () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const fixturePath = path.join(
      process.cwd(),
      "test-fixtures/website-scanner/missing-alt.html",
    );
    const html = fs.readFileSync(fixturePath, "utf8");
    server = http.createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
    });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });
    const addr = server.address();
    if (!addr || typeof addr === "string") throw new Error("no port");
    baseUrl = `http://127.0.0.1:${addr.port}/`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it("detects image-alt on local fixture", async () => {
    const scanner = new LocalPlaywrightScanner();
    const result = await scanner.scanPage({
      url: baseUrl,
      viewport: SCAN_VIEWPORTS.desktop,
      mode: "single_page",
      rootOrigin: null,
      includeBestPractices: false,
    });
    const ids = result.violations.map((v) => v.id);
    expect(ids).toContain("image-alt");
  }, 60_000);
  },
);
