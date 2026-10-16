import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { LocalPlaywrightScanner } from "@/features/website-scanner/server/runtime/localPlaywrightScanner";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";
import { startSsrfFixtureServer } from "../../../../test-fixtures/website-scanner/ssrf/ssrfFixtureServer";
import { WEBSITE_SCANNER_INTEGRATION_ENABLED } from "./integrationEnv";

describe.skipIf(!WEBSITE_SCANNER_INTEGRATION_ENABLED)(
  "SSRF integration (local fixtures)",
  () => {
    let baseUrl: string;
    let closeFixture: () => Promise<void>;

    beforeAll(async () => {
      const fixture = await startSsrfFixtureServer();
      baseUrl = fixture.baseUrl;
      closeFixture = fixture.close;
    });

    afterAll(async () => {
      await closeFixture();
    });

    async function expectScanBlocked(path: string) {
      const scanner = new LocalPlaywrightScanner();
      try {
        await scanner.scanPage({
          url: `${baseUrl}${path}`,
          viewport: SCAN_VIEWPORTS.desktop,
          mode: "single_page",
          rootOrigin: null,
          includeBestPractices: false,
        });
        throw new Error("expected scan to fail");
      } catch (err) {
        expect(err).toBeInstanceOf(WebsiteScanError);
        const code = (err as WebsiteScanError).code;
        expect(["BLOCKED_DESTINATION", "NAVIGATION_TIMEOUT", "BROWSER_ERROR"]).toContain(
          code,
        );
      }
    }

    it("blocks redirect to private IPv4", async () => {
      await expectScanBlocked("/redirect/private-ipv4");
    }, 60_000);

    it("blocks redirect to metadata IP", async () => {
      await expectScanBlocked("/redirect/metadata");
    }, 60_000);

    it("does not hang on redirect loop", async () => {
      await expectScanBlocked("/redirect/loop-a");
    }, 60_000);

    it("completes scan for subresource pages without hanging", async () => {
      const scanner = new LocalPlaywrightScanner();
      for (const path of [
        "/subresource/img-private",
        "/subresource/script-private",
        "/subresource/metadata-img",
        "/ok",
      ]) {
        const result = await scanner.scanPage({
          url: `${baseUrl}${path}`,
          viewport: SCAN_VIEWPORTS.desktop,
          mode: "single_page",
          rootOrigin: null,
          includeBestPractices: false,
        });
        expect(result.finalUrl).toContain("127.0.0.1");
      }
    }, 120_000);
  },
);
