import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LocalPlaywrightScanner } from "@/features/website-scanner/server/runtime/localPlaywrightScanner";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";

const RUN =
  process.env.WEBSITE_SCANNER_INTEGRATION === "1" &&
  process.env.WEBSITE_SCANNER_TEST_ALLOW_LOOPBACK === "1";

describe.skipIf(!RUN)("accessibility benchmark fixtures", () => {
  async function scanFixture(name: string) {
    const fixtureDir = path.join(
      process.cwd(),
      "test-fixtures/accessibility-benchmark",
    );
    const html = fs.readFileSync(path.join(fixtureDir, name), "utf8");
    const http = await import("node:http");
    const server = http.createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", () => resolve()),
    );
    const addr = server.address();
    if (!addr || typeof addr === "string") throw new Error("no port");
    const url = `http://127.0.0.1:${addr.port}/`;
    const scanner = new LocalPlaywrightScanner();
    const result = await scanner.scanPage({
      url,
      viewport: SCAN_VIEWPORTS.desktop,
      mode: "single_page",
      rootOrigin: null,
      includeBestPractices: false,
    });
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
    return result;
  }

  it("detects button-name on known-fail fixture", async () => {
    const result = await scanFixture("button-name-fail.html");
    expect(result.violations.some((v) => v.id === "button-name")).toBe(true);
  }, 60_000);

  it("does not report button-name on known-pass fixture", async () => {
    const result = await scanFixture("button-name-pass.html");
    expect(result.violations.some((v) => v.id === "button-name")).toBe(false);
  }, 60_000);
});
