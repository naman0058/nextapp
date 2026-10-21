import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { describe, expect, it } from "vitest";
import { buildSiteScanIntelligence } from "@/features/accessibility-intelligence/buildSiteScanIntelligence";
import { buildAxeRunTags } from "@/features/website-scanner/constants/axeScanConfig";
import { assertNoUndocumentedAutomatedRuleLoss } from "@/features/website-scanner/coverage/findingLossPolicy";
import { LocalPlaywrightScanner } from "@/features/website-scanner/server/runtime/localPlaywrightScanner";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";
import { WEBSITE_SCANNER_INTEGRATION_ENABLED } from "@/features/website-scanner/__tests__/integrationEnv";

const FIXTURE_DIR = path.join(
  process.cwd(),
  "test-fixtures/website-scanner/coverage",
);

const WCAG_FIXTURES: { file: string; ruleId: string; bestPractice?: boolean }[] =
  [
    { file: "color-contrast-fail.html", ruleId: "color-contrast" },
    { file: "image-alt-fail.html", ruleId: "image-alt" },
    { file: "link-name-fail.html", ruleId: "link-name" },
    { file: "label-fail.html", ruleId: "label" },
    { file: "aria-allowed-attr-fail.html", ruleId: "aria-allowed-attr" },
    { file: "html-has-lang-fail.html", ruleId: "html-has-lang" },
    { file: "bypass-fail.html", ruleId: "bypass" },
  ];

const BP_FIXTURES: { file: string; ruleId: string }[] = [
  { file: "landmark-one-main-fail.html", ruleId: "landmark-one-main" },
  { file: "heading-order-fail.html", ruleId: "heading-order" },
];

describe.skipIf(!WEBSITE_SCANNER_INTEGRATION_ENABLED)(
  "coverage HTML fixtures (Playwright + axe)",
  () => {
    async function scanHtmlFile(name: string, includeBestPractices: boolean) {
      const html = fs.readFileSync(path.join(FIXTURE_DIR, name), "utf8");
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
        includeBestPractices,
        captureCoverageAudit: true,
      });
      await new Promise<void>((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve())),
      );
      return result;
    }

    for (const { file, ruleId } of WCAG_FIXTURES) {
      it(`detects ${ruleId} on ${file}`, async () => {
        const result = await scanHtmlFile(file, false);
        expect(result.violations.some((v) => v.id === ruleId)).toBe(true);
        expect(result.coverageAudit?.undocumentedLosses ?? []).toEqual([]);
        const intel = buildSiteScanIntelligence([result]);
        assertNoUndocumentedAutomatedRuleLoss({
          rawInventory: result.coverageAudit?.rawInventory ?? [],
          includeBestPractices: false,
          displayedUniqueAutomatedRules: intel.summary.uniqueAutomatedRules,
        });
      }, 60_000);
    }

    for (const { file, ruleId } of BP_FIXTURES) {
      it(`detects best-practice ${ruleId} when enabled (${file})`, async () => {
        const result = await scanHtmlFile(file, true);
        expect(result.violations.some((v) => v.id === ruleId)).toBe(true);
      }, 60_000);
    }

    it("target=_blank alone is not an axe WCAG violation (vendor-specific advisory)", async () => {
      const result = await scanHtmlFile("target-blank-advisory.html", true);
      const wcagViolations = result.violations.filter((v) => !v.isBestPractice);
      expect(wcagViolations.some((v) => v.id === "target-new-window")).toBe(false);
    }, 60_000);
  },
);

describe("coverage fixture trace (unit, no browser)", () => {
  it("documents axe run tag profile used by scanner", () => {
    expect(buildAxeRunTags(false)).toEqual([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
      "wcag22aa",
    ]);
  });
});
