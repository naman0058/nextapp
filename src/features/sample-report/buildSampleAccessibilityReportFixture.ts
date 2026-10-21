import { buildSiteScanIntelligence } from "@/features/accessibility-intelligence/buildSiteScanIntelligence";
import { WEBSITE_MANUAL_REVIEW_ITEMS } from "@/features/website-scanner/constants/manualReviewChecklist";
import { createInitialWebsiteSession } from "@/features/website-scanner/state/websiteScanReducer";
import type {
  WebsitePageEntry,
  WebsiteScanSessionState,
} from "@/features/website-scanner/types/websiteSession";
import type { ViewportPageComparison } from "@/features/website-scanner/types/viewportComparison";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { aggregateSiteIssues } from "@/features/website-scanner/utils/aggregateSiteIssues";
import {
  comparePageViewports,
  summarizeViewportComparison,
} from "@/features/website-scanner/utils/compareViewportAccessibility";
import { collectPageScanResults } from "@/features/website-scanner/utils/collectPageScanResults";
import { safeCrawlKey } from "@/features/website-scanner/utils/crawl/safeCrawlKey";
import { fixTaskKeyForRootCause } from "@/features/website-scanner/utils/fixTaskKeys";
import {
  buildSampleAxePages,
  buildSampleRescanCurrentPages,
  buildSampleRescanPreviousPages,
  getSamplePagePaths,
} from "@/features/sample-report/buildSampleAxePages";
import {
  SAMPLE_DEMONSTRATION_DATE,
  SAMPLE_FICTIONAL_ORG,
  SAMPLE_FICTIONAL_ORG_FULL,
  SAMPLE_ROOT_URL,
} from "@/features/sample-report/constants";

export type SampleAccessibilityReportFixture = {
  session: import("@/features/website-scanner/types/websiteSession").WebsiteScanSessionState;
  completedPages: WebsitePageScanResult[];
  rescanDemo: {
    previous: WebsitePageScanResult[];
    current: WebsitePageScanResult[];
  };
};

function groupResultsByUrl(
  pages: WebsitePageScanResult[],
): Map<string, { desktop?: WebsitePageScanResult; mobile?: WebsitePageScanResult }> {
  const map = new Map<string, { desktop?: WebsitePageScanResult; mobile?: WebsitePageScanResult }>();
  for (const p of pages) {
    const row = map.get(p.finalUrl) ?? {};
    if (p.viewport.id === "desktop") row.desktop = p;
    else row.mobile = p;
    map.set(p.finalUrl, row);
  }
  return map;
}

function buildPageEntries(flatResults: WebsitePageScanResult[]): WebsitePageEntry[] {
  const byUrl = groupResultsByUrl(flatResults);
  const entries: WebsitePageEntry[] = [];
  for (const url of getSamplePagePaths()) {
    const row = byUrl.get(url);
    if (!row?.desktop) continue;
    const comparison =
      row.desktop && row.mobile
        ? comparePageViewports(url, row.desktop, row.mobile)
        : undefined;
    entries.push({
      url,
      normalizedKey: safeCrawlKey(url),
      depth: url === SAMPLE_ROOT_URL ? 0 : 1,
      status: "complete",
      desktopResult: row.desktop,
      mobileResult: row.mobile,
      viewportComparison: comparison,
    });
  }
  return entries;
}

export function buildSampleAccessibilityReportFixture(): SampleAccessibilityReportFixture {
  const flatResults = buildSampleAxePages();
  const pageEntries = buildPageEntries(flatResults);
  const completedPages = collectPageScanResults(pageEntries);
  const intel = buildSiteScanIntelligence(completedPages, {
    generatedAt: "2026-03-15T14:05:00.000Z",
  });
  const aggregates = aggregateSiteIssues(completedPages);
  const viewportComparisons: ViewportPageComparison[] = pageEntries
    .map((p) => p.viewportComparison)
    .filter((c): c is ViewportPageComparison => c != null);
  const viewportSummary = summarizeViewportComparison(viewportComparisons);

  const manualReview = WEBSITE_MANUAL_REVIEW_ITEMS.map((item, index) => {
    const demo: Array<"not_reviewed" | "passes" | "needs_review" | "not_applicable"> = [
      "passes",
      "needs_review",
      "not_reviewed",
      "passes",
      "needs_review",
      "not_applicable",
      "not_reviewed",
      "passes",
    ];
    return {
      itemId: item.id,
      status: demo[index % demo.length] ?? "not_reviewed",
      note: "",
    };
  });

  const navGroup = intel.rootCauseGroups.find((g) => g.ruleId === "button-name");
  const labelGroup = intel.rootCauseGroups.find((g) => g.ruleId === "label");

  const fixTaskStatus: Record<string, import("@/features/website-scanner/types/resultUx").UserFixTaskStatus> =
    {};
  if (navGroup) {
    fixTaskStatus[fixTaskKeyForRootCause(navGroup.id)] = "user_marked_fixed";
  }
  if (labelGroup) {
    fixTaskStatus[fixTaskKeyForRootCause(labelGroup.id)] = "user_marked_fixed";
  }
  fixTaskStatus["rank-3"] = "in_review";

  const sampleAiRemediationByGroup =
    navGroup ?
      {
        [navGroup.id]: {
          report: {
            version: "1.0",
            source: "website" as const,
            title: "Sample: Navigation buttons need accessible names",
            problemSummary:
              "Icon-only controls in the shared header may not expose a meaningful accessible name.",
            whyItMatters:
              "Screen reader users need a name that describes each control's purpose.",
            recommendedApproach: [
              "Add visible text or an accessible name that matches the control purpose.",
            ],
            suggestedCode: {
              language: "html",
              code: '<button type="button" aria-label="Open main menu">…</button>',
              explanation: "Example pattern only — review in your codebase.",
            },
            suggestedContent: null,
            alternatives: [],
            mistakesToAvoid: ["Do not use empty buttons without an accessible name."],
            acceptanceCriteria: ["Each affected control has a discernible name."],
            verificationSteps: ["Re-run scan after fix.", "Tab to each control with a screen reader."],
            humanReview: ["Confirm labels match visible intent across templates."],
            assumptions: ["Generic HTML sample; not a compliance claim."],
            limitations: ["Sample static content — not generated by live OpenAI."],
            confidenceNote: null,
          },
          facts: {
            ruleId: "button-name",
            impact: "critical",
            affectedElementCount: navGroup.totalOccurrences,
            affectedPageCount: navGroup.affectedPages.length,
          },
          frameworkPreference: "generic_html" as const,
          stale: false,
          generatedAt: SAMPLE_DEMONSTRATION_DATE,
        },
      }
    : {};

  const base = createInitialWebsiteSession({
    fixedNow: SAMPLE_DEMONSTRATION_DATE,
    fixedWorkspaceId: "sample-workspace",
  });
  const session = {
    ...base,
    sessionId: "sample-demo-session",
    rootUrl: SAMPLE_ROOT_URL,
    finalOrigin: SAMPLE_ROOT_URL,
    mode: "small_site" as const,
    viewportId: "desktop" as const,
    includeBestPractices: false,
    startedAt: "2026-03-15T13:55:00.000Z",
    completedAt: "2026-03-15T14:05:00.000Z",
    status: "complete" as const,
    stageLabel: "Sample demonstration complete",
    pages: pageEntries,
    discoveredTotal: pageEntries.length,
    manualReview,
    aiGuidance: {},
    aiGuidanceByGroup: {},
    aiRemediationByGroup: sampleAiRemediationByGroup,
    scanRevision: 1,
    previousSnapshot: null,
    aggregates,
    siteIntelligence: intel,
    liveMessage: "",
    resultView: "overview" as const,
    issuesGroupBy: "root-cause" as const,
    explanationLevel: "simple" as const,
    fixTaskStatus,
    includeDeveloperFixGuidanceInReport: false,
    includeAiRemediationInReport: false,
    aiRemediationInclusionById: {},
    showAllManualChecks: true,
    highlightFixTaskId: null,
    setupPhase: "ready_to_scan" as const,
    scanSource: "discover_site" as const,
    discoverySource: "sitemap" as const,
    discoveredUrls: pageEntries.map((p) => ({
      url: p.url,
      normalizedKey: p.normalizedKey,
      source: "sitemap" as const,
      depth: p.depth,
    })),
    selectedUrlKeys: pageEntries.map((p) => p.normalizedKey),
    suggestedUrlKeys: pageEntries.map((p) => p.normalizedKey),
    urlPatternGroups: [],
    externalUrlsIgnoredCount: 0,
    scanScope: {
      discoverySource: "sitemap" as const,
      urlsDiscovered: pageEntries.length,
      urlsSelected: pageEntries.length,
      pagesCompleted: pageEntries.length,
      pagesPartial: 0,
      pagesFailed: 0,
      pagesSkippedRobots: 0,
      urlsNotScanned: 0,
    },
    viewportMode: "compare" as const,
    scanWorkload: {
      selectedPages: pageEntries.length,
      viewportsPerPage: 2,
      totalPageEvaluations: completedPages.length,
    },
    siteBatchId: null,
    viewportComparisonSummary: viewportSummary,
    reportBranding: {
      preparedFor: SAMPLE_FICTIONAL_ORG_FULL,
      clientOrganization: SAMPLE_FICTIONAL_ORG,
      projectName: "Public website accessibility preflight",
      preparedBy: "Accessible Content Preflight",
      reportSubtitle: `Sample report — ${SAMPLE_DEMONSTRATION_DATE}`,
      accentColor: "#1e40af",
      logoDataUrl: null,
    },
    exportPreferences: {
      ...base.exportPreferences,
      includeAiGuidance: false,
    },
  };

  return {
    session: session as WebsiteScanSessionState,
    completedPages,
    rescanDemo: {
      previous: buildSampleRescanPreviousPages(),
      current: buildSampleRescanCurrentPages(),
    },
  };
}
