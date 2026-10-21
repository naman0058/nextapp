import AxeBuilder from "@axe-core/playwright";
import type { BrowserContext } from "playwright";
import {
  AXE_EXPLICIT_RULE_IDS,
  buildAxeRunTags,
} from "@/features/website-scanner/constants/axeScanConfig";
import { buildSiteScanIntelligence } from "@/features/accessibility-intelligence/buildSiteScanIntelligence";
import { buildPageScanCoverageAudit } from "@/features/website-scanner/coverage/buildScanCoverageAudit";
import { shouldCaptureCoverageAudit } from "@/features/website-scanner/coverage/shouldCaptureCoverageAudit";
import { summarizeRawAxeResults } from "@/features/website-scanner/coverage/summarizeRawAxeResults";
import {
  MAX_REDIRECTS,
  PAGE_NAVIGATION_TIMEOUT_MS,
  PAGE_SETTLE_MS,
  PAGE_TOTAL_SCAN_TIMEOUT_MS,
} from "@/features/website-scanner/constants/scanLimits";
import { SCANNER_VERSION } from "@/features/website-scanner/constants/scannerVersion";
import { normalizeAxeResults } from "@/features/website-scanner/server/axe/normalizeAxeResults";
import {
  assembleScanQuality,
  buildPageNodeReporting,
  deriveScanCompleteness,
} from "@/features/website-scanner/server/playwright/scanQuality";
import { MAX_TOTAL_REPORTED_NODES_PER_PAGE } from "@/features/website-scanner/constants/scanLimits";
import { discoverSameOriginLinks } from "@/features/website-scanner/server/playwright/discoverSameOriginLinks";
import { extractPageMetadata } from "@/features/website-scanner/server/playwright/extractPageMetadata";
import { boundedLazyScroll } from "@/features/website-scanner/server/playwright/lazyScroll";
import {
  attachNetworkGuard,
  type NetworkGuardState,
} from "@/features/website-scanner/server/playwright/networkGuard";
import { attachRedirectGuard } from "@/features/website-scanner/server/playwright/redirectGuard";
import { getScannerUserAgent } from "@/features/website-scanner/server/playwright/scannerConfig";
import { allowLoopbackForTests } from "@/features/website-scanner/server/security/testBypass";
import { validateScanTargetUrl } from "@/features/website-scanner/server/security/validateScanTarget";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";
import type {
  WebsitePageScanRequest,
  WebsitePageScanResult,
} from "@/features/website-scanner/types/scanTypes";

function throwIfRedirectError(
  takeError: () => WebsiteScanError | null,
): void {
  const err = takeError();
  if (err) throw err;
}

export async function scanPageInContext(
  context: BrowserContext,
  request: WebsitePageScanRequest,
): Promise<WebsitePageScanResult> {
  const started = Date.now();
  const warnings: string[] = [];
  const validated = await validateScanTargetUrl(request.url);

  const page = await context.newPage();
  page.setDefaultTimeout(PAGE_NAVIGATION_TIMEOUT_MS);

  page.on("dialog", (d) => {
    void d.dismiss();
  });

  page.on("popup", (popup) => {
    void popup.close().catch(() => undefined);
  });

  const networkState: NetworkGuardState = { requestCount: 0, warnings: [] };
  const loopbackFixture = allowLoopbackForTests(validated.hostname);
  if (!loopbackFixture) {
    await attachNetworkGuard(page, networkState);
  }
  const useRedirectGuard = !allowLoopbackForTests(validated.hostname);
  const redirectGuard = useRedirectGuard ? attachRedirectGuard(page) : null;

  let httpStatus: number | undefined;
  let finalUrl = validated.href;

  const scanDeadline = started + PAGE_TOTAL_SCAN_TIMEOUT_MS;
  let domContentLoadedMs: number | undefined;
  let settleMs: number | undefined;

  try {
    const navStart = Date.now();
    const response = await page.goto(validated.href, {
      waitUntil: "domcontentloaded",
      timeout: PAGE_NAVIGATION_TIMEOUT_MS,
    });

    domContentLoadedMs = Date.now() - navStart;
    if (response) {
      httpStatus = response.status();
      finalUrl = response.url();
      await validateScanTargetUrl(finalUrl);
    }
    if (redirectGuard) {
      throwIfRedirectError(redirectGuard.takeError);
      await page.waitForTimeout(50);
      throwIfRedirectError(redirectGuard.takeError);
    }

    const remainingSettle = Math.min(
      PAGE_SETTLE_MS,
      scanDeadline - Date.now(),
    );
    if (remainingSettle > 0) {
      await page.waitForTimeout(remainingSettle);
      settleMs = remainingSettle;
    }

    const lazyLimited = loopbackFixture;
    if (!loopbackFixture) {
      await boundedLazyScroll(page);
    }

    const { metadata, domTooLarge } = await extractPageMetadata(
      page,
      new URL(finalUrl).origin,
    );

    if (domTooLarge) {
      warnings.push(
        "This page has a very large DOM. Automated checks may be incomplete.",
      );
      throw new WebsiteScanError(
        "PAGE_TOO_LARGE",
        "This page exceeds safe processing limits for automated scanning.",
      );
    }

    if (Date.now() > scanDeadline) {
      throw new WebsiteScanError(
        "NAVIGATION_TIMEOUT",
        "This page took too long to scan.",
      );
    }

    const tags = buildAxeRunTags(request.includeBestPractices);
    let axeBuilder = new AxeBuilder({ page }).withTags([...tags]);
    if (AXE_EXPLICIT_RULE_IDS.length > 0) {
      axeBuilder = axeBuilder.options({
        rules: Object.fromEntries(
          AXE_EXPLICIT_RULE_IDS.map((id) => [id, { enabled: true }]),
        ),
      });
    }

    const axeStart = Date.now();
    const axeResults = await axeBuilder.analyze();
    const axeDurationMs = Date.now() - axeStart;
    const normalized = normalizeAxeResults(
      axeResults,
      request.includeBestPractices,
    );
    const examplesShown = normalized.violations.reduce(
      (n, v) => n + v.nodes.length,
      0,
    );
    const nodeEvidenceTruncated =
      normalized.violations.some(
        (v) => v.totalNodeCount > v.nodes.length,
      ) || examplesShown >= MAX_TOTAL_REPORTED_NODES_PER_PAGE;

    const pageTitle = await page.title();
    let discoveredLinks: string[] = [];
    if (request.mode === "small_site") {
      discoveredLinks = await discoverSameOriginLinks(page, finalUrl);
    }

    warnings.push(...networkState.warnings);
    const networkBudgetExceeded = networkState.warnings.some((w) =>
      w.includes("network-resource limit"),
    );
    if (nodeEvidenceTruncated) {
      warnings.push(
        "Some affected elements are not shown individually. Total occurrence counts are preserved.",
      );
    }
    if (metadata.iframeCount > 0) {
      warnings.push(
        "Embedded frames may not be fully evaluated in this scan.",
      );
    }

    const scanQuality = assembleScanQuality({
      networkBudgetExceeded,
      domTooLarge: false,
      nodeEvidenceTruncated,
      iframeCount: metadata.iframeCount,
      lazyLimited,
      scanTimeout: false,
      timings: {
        domContentLoadedMs,
        settleMs,
        axeDurationMs,
        totalDurationMs: Date.now() - started,
      },
    });
    const scanCompleteness = deriveScanCompleteness({
      warnings,
      networkBudgetExceeded,
      nodeEvidenceTruncated,
      scanTimeout: false,
    });

    const pageResult: WebsitePageScanResult = {
      requestedUrl: validated.href,
      finalUrl,
      pageTitle: pageTitle || null,
      scannedAt: new Date().toISOString(),
      viewport: request.viewport,
      httpStatus,
      durationMs: Date.now() - started,
      axeVersion: normalized.axeVersion,
      scannerVersion: SCANNER_VERSION,
      summary: normalized.summary,
      violations: normalized.violations,
      incomplete: normalized.incomplete,
      axeEvaluatedRules: normalized.axeEvaluatedRules,
      passesCount: normalized.passesCount,
      inapplicableCount: normalized.inapplicableCount,
      discoveredLinks,
      warnings,
      pageMetadata: metadata,
      scanCompleteness,
      scanQuality,
      nodeReporting: buildPageNodeReporting(
        normalized.violations,
        examplesShown,
      ),
    };

    if (shouldCaptureCoverageAudit(request)) {
      const rawInventory = summarizeRawAxeResults(axeResults);
      const intel = buildSiteScanIntelligence([pageResult]);
      const issueRuleIds = new Set(
        intel.normalizedFindings
          .filter((f) => f.status === "issue" && f.ruleId)
          .map((f) => f.ruleId!),
      );
      const reviewRuleIds = new Set(
        intel.normalizedFindings
          .filter((f) => f.status === "review" && f.ruleId)
          .map((f) => f.ruleId!),
      );
      const rootCauseRuleIds = new Set(
        intel.rootCauseGroups.map((g) => g.ruleId),
      );
      pageResult.coverageAudit = buildPageScanCoverageAudit({
        pageUrl: finalUrl,
        includeBestPractices: request.includeBestPractices,
        axeRunTags: tags,
        rawInventory,
        page: pageResult,
        rootCauseRuleIds,
        normalizedIssueRuleIds: issueRuleIds,
        normalizedReviewRuleIds: reviewRuleIds,
        reportFindingRuleIds: new Set(),
      });
    }

    return pageResult;
  } catch (err) {
    if (err instanceof WebsiteScanError) throw err;
    const message =
      err instanceof Error ? err.message : "Browser scan failed.";
    if (message.toLowerCase().includes("timeout")) {
      throw new WebsiteScanError(
        "NAVIGATION_TIMEOUT",
        "This page took too long to load or scan.",
      );
    }
    if (message.toLowerCase().includes("net::err_cert")) {
      throw new WebsiteScanError(
        "UNSUPPORTED_RESPONSE",
        "Secure connection to this page could not be established.",
      );
    }
    const safeMessage =
      process.env.NODE_ENV === "test" && message
        ? message.slice(0, 200)
        : "Could not scan this page.";
    throw new WebsiteScanError("BROWSER_ERROR", safeMessage);
  } finally {
    await page.close().catch(() => undefined);
  }
}

export async function createIsolatedScanContext(
  browser: Awaited<
    ReturnType<
      typeof import("@/features/website-scanner/server/playwright/browserPool").getSharedBrowser
    >
  >,
  viewport: { width: number; height: number },
): Promise<BrowserContext> {
  return browser.newContext({
    userAgent: getScannerUserAgent(),
    viewport,
    serviceWorkers: "block",
    acceptDownloads: false,
    ignoreHTTPSErrors: false,
  });
}

/** Guard redirect count on navigation — simplified: validate final URL only after goto. */
export const REDIRECT_LIMIT = MAX_REDIRECTS;
