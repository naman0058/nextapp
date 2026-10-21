import { WEBSITE_MANUAL_REVIEW_ITEMS } from "@/features/website-scanner/constants/manualReviewChecklist";
import { MAX_CRAWL_DEPTH, MAX_SITE_SCAN_PAGES } from "@/features/website-scanner/constants/scanLimits";
import type { ScanViewportId } from "@/features/website-scanner/constants/viewports";
import type { WebsiteFixGuidance } from "@/features/website-scanner/types/aiFixGuidance";
import type {
  ManualReviewEntry,
  WebsitePageEntry,
  WebsiteScanSessionState,
  WebsiteScanSessionStatus,
} from "@/features/website-scanner/types/websiteSession";
import type {
  SiteRuleAggregate,
  WebsitePageScanResult,
  WebsiteScanMode,
} from "@/features/website-scanner/types/scanTypes";
import { buildSiteScanIntelligence } from "@/features/accessibility-intelligence/buildSiteScanIntelligence";
import {
  DEFAULT_EXPORT_PREFERENCES,
  DEFAULT_REPORT_BRANDING,
  type DiscoveredUrl,
  type ScanScopeSummary,
} from "@/features/website-scanner/types/websiteDiscovery";
import { aggregateSiteIssues } from "@/features/website-scanner/utils/aggregateSiteIssues";
import { DEFAULT_ISSUES_FILTER } from "@/features/website-scanner/utils/issuesListUtils";
import {
  createInitialAccessibilityWorkspace,
  WORKSPACE_SSR_PLACEHOLDER_ID,
  WORKSPACE_SSR_PLACEHOLDER_TIME,
} from "@/features/accessibility-workspace/createInitialWorkspace";
import type { ReportContribution } from "@/features/accessibility-workspace/types";
import { syncSessionHumanReview } from "@/features/human-review-workspace/syncSessionHumanReview";
import { patchManualReviewAndRecords } from "@/features/human-review-workspace/syncSessionHumanReview";
import { collectPageScanResults } from "@/features/website-scanner/utils/collectPageScanResults";
import {
  comparePageViewports,
  summarizeViewportComparison,
} from "@/features/website-scanner/utils/compareViewportAccessibility";
import { safeCrawlKey } from "@/features/website-scanner/utils/crawl/safeCrawlKey";

function safeCrawlKeyFromUrl(url: string): string {
  return safeCrawlKey(url);
}

function defaultManualReview(): ManualReviewEntry[] {
  return WEBSITE_MANUAL_REVIEW_ITEMS.map((item) => ({
    itemId: item.id,
    status: "not_reviewed",
    note: "",
  }));
}

function emptyScanScope(): ScanScopeSummary {
  return {
    discoverySource: "current",
    urlsDiscovered: 0,
    urlsSelected: 0,
    pagesCompleted: 0,
    pagesPartial: 0,
    pagesFailed: 0,
    pagesSkippedRobots: 0,
    urlsNotScanned: 0,
  };
}

function recomputeScope(state: WebsiteScanSessionState): ScanScopeSummary {
  const pagesCompleted = state.pages.filter((p) => p.status === "complete").length;
  const pagesFailed = state.pages.filter((p) => p.status === "failed").length;
  const pagesPartial = state.pages.filter(
    (p) =>
      p.status === "complete" &&
      (p.result?.scanCompleteness === "partial" ||
        p.desktopResult?.scanCompleteness === "partial" ||
        p.mobileResult?.scanCompleteness === "partial"),
  ).length;
  const pagesSkippedRobots = state.pages.filter(
    (p) => p.status === "skipped",
  ).length;
  return {
    ...state.scanScope,
    urlsDiscovered: state.discoveredUrls.length || state.discoveredTotal,
    urlsSelected: state.selectedUrlKeys.length,
    pagesCompleted,
    pagesPartial,
    pagesFailed,
    pagesSkippedRobots,
    urlsNotScanned: Math.max(
      0,
      (state.discoveredUrls.length || 0) - state.selectedUrlKeys.length,
    ),
  };
}

export function createInitialWebsiteSession(options?: {
  fixedNow?: string;
  fixedWorkspaceId?: string;
}): WebsiteScanSessionState {
  return {
    sessionId: "",
    rootUrl: "",
    finalOrigin: null,
    mode: "single_page",
    viewportId: "desktop",
    includeBestPractices: true,
    startedAt: null,
    completedAt: null,
    status: "idle",
    stageLabel: "",
    pages: [],
    crawlQueue: [],
    discoveredTotal: 0,
    manualReview: defaultManualReview(),
    aiGuidance: {},
    previousSnapshot: null,
    aggregates: null,
    siteIntelligence: null,
    liveMessage: "",
    resultView: "overview",
    issuesGroupBy: "root-cause",
    issuesFilter: { ...DEFAULT_ISSUES_FILTER },
    explanationLevel: "simple",
    fixTaskStatus: {},
    aiGuidanceByGroup: {},
    aiRemediationByGroup: {},
    scanRevision: 0,
    includeDeveloperFixGuidanceInReport: false,
    includeAiRemediationInReport: false,
    aiRemediationInclusionById: {},
    showAllManualChecks: false,
    highlightFixTaskId: null,
    highlightFindingId: null,
    highlightHumanReviewCheckId: null,
    setupPhase: "configure",
    scanSource: "current_page",
    discoverySource: "current",
    discoveredUrls: [],
    selectedUrlKeys: [],
    suggestedUrlKeys: [],
    urlPatternGroups: [],
    externalUrlsIgnoredCount: 0,
    scanScope: emptyScanScope(),
    viewportMode: "desktop",
    scanWorkload: {
      selectedPages: 0,
      viewportsPerPage: 1,
      totalPageEvaluations: 0,
    },
    siteBatchId: null,
    viewportComparisonSummary: null,
    reportBranding: { ...DEFAULT_REPORT_BRANDING },
    exportPreferences: { ...DEFAULT_EXPORT_PREFERENCES },
    accessibilityWorkspace: createInitialAccessibilityWorkspace(undefined, {
      fixedNow: options?.fixedNow,
      fixedWorkspaceId: options?.fixedWorkspaceId,
    }),
  };
}

function upsertContribution(
  list: ReportContribution[],
  contribution: ReportContribution,
): ReportContribution[] {
  const idx = list.findIndex((c) => c.contributionId === contribution.contributionId);
  if (idx === -1) return [...list, contribution];
  const copy = [...list];
  copy[idx] = contribution;
  return copy;
}

export type WebsiteScanAction =
  | { type: "INIT_CLIENT"; sessionId: string }
  | {
      type: "START_SCAN";
      rootUrl: string;
      mode: WebsiteScanMode;
      viewportId: ScanViewportId;
      includeBestPractices: boolean;
    }
  | { type: "SET_STAGE"; stageLabel: string; liveMessage?: string }
  | { type: "SET_STATUS"; status: WebsiteScanSessionStatus }
  | { type: "SET_FINAL_ORIGIN"; origin: string }
  | { type: "ENQUEUE_PAGES"; items: { url: string; depth: number }[] }
  | { type: "SET_DISCOVERED_TOTAL"; count: number }
  | { type: "PAGE_SCANNING"; url: string }
  | {
      type: "PAGE_COMPLETE";
      url: string;
      result: WebsitePageScanResult;
      newLinks: { url: string; depth: number }[];
    }
  | { type: "PAGE_FAILED"; url: string; errorMessage: string }
  | { type: "PAGE_SKIPPED"; url: string; reason: string }
  | { type: "STOP_SCAN" }
  | { type: "FINISH_SCAN" }
  | {
      type: "SET_MANUAL_REVIEW";
      itemId: string;
      status: ManualReviewEntry["status"];
      note?: string;
    }
  | { type: "SET_AI_GUIDANCE"; guidance: WebsiteFixGuidance[] }
  | { type: "MARK_AI_STALE" }
  | { type: "SAVE_SNAPSHOT_FOR_COMPARE" }
  | { type: "SET_RESULT_VIEW"; view: WebsiteScanSessionState["resultView"] }
  | { type: "OPEN_HUMAN_REVIEW_CHECK"; checkDefinitionId: string }
  | { type: "FOCUS_FINDING"; findingId: string }
  | { type: "SET_ISSUES_GROUP_BY"; groupBy: WebsiteScanSessionState["issuesGroupBy"] }
  | {
      type: "OPEN_ISSUES_WITH_FILTER";
      filter: Partial<
        import("@/features/website-scanner/utils/issuesListUtils").IssuesFilterState
      >;
    }
  | {
      type: "SET_ISSUES_FILTER";
      filter: import("@/features/website-scanner/utils/issuesListUtils").IssuesFilterState;
    }
  | { type: "SET_EXPLANATION_LEVEL"; level: WebsiteScanSessionState["explanationLevel"] }
  | {
      type: "SET_FIX_TASK_STATUS";
      taskKey: string;
      status: import("@/features/website-scanner/types/resultUx").UserFixTaskStatus;
    }
  | { type: "SET_AI_GUIDANCE_GROUP"; groupId: string; guidance: WebsiteFixGuidance }
  | {
      type: "SET_AI_REMEDIATION_GROUP";
      groupId: string;
      entry: import("@/features/website-scanner/types/websiteAiRemediation").WebsiteAiRemediationEntry;
    }
  | { type: "SET_HIGHLIGHT_FIX_TASK"; taskId: string | null }
  | { type: "MERGE_PENDING_CONTRIBUTIONS"; contributions: ReportContribution[] }
  | { type: "UPSERT_REPORT_CONTRIBUTION"; contribution: ReportContribution }
  | {
      type: "SET_CONTRIBUTION_INCLUDED";
      contributionId: string;
      included: boolean;
    }
  | { type: "REMOVE_REPORT_CONTRIBUTION"; contributionId: string }
  | {
      type: "APPLY_RETURN_TO_FINDING";
      returnTo: import("@/features/accessibility-workspace/types").ReturnToFindingContext;
    }
  | { type: "SET_INCLUDE_DEV_GUIDANCE_REPORT"; value: boolean }
  | { type: "SET_INCLUDE_AI_REMEDIATION_REPORT"; value: boolean }
  | { type: "SET_AI_REMEDIATION_INCLUSION"; id: string; included: boolean }
  | { type: "SET_AI_REMEDIATION_INCLUSION_BULK"; ids: string[]; included: boolean }
  | { type: "SET_SHOW_ALL_MANUAL_CHECKS"; value: boolean }
  | { type: "SET_SETUP_PHASE"; phase: WebsiteScanSessionState["setupPhase"] }
  | { type: "SET_SCAN_SOURCE"; source: WebsiteScanSessionState["scanSource"] }
  | { type: "SET_VIEWPORT_MODE"; mode: WebsiteScanSessionState["viewportMode"] }
  | {
      type: "SET_DISCOVERY_RESULTS";
      urls: DiscoveredUrl[];
      externalIgnored: number;
      discoverySource: ScanScopeSummary["discoverySource"];
    }
  | { type: "SET_URL_PATTERN_GROUPS"; groups: WebsiteScanSessionState["urlPatternGroups"] }
  | { type: "SET_SUGGESTED_URL_KEYS"; keys: string[] }
  | { type: "TOGGLE_URL_SELECTION"; normalizedKey: string; url: string }
  | { type: "SET_SELECTED_URL_KEYS"; keys: string[] }
  | { type: "CLEAR_URL_SELECTION" }
  | {
      type: "START_BATCH_SCAN";
      rootUrl: string;
      selectedUrls: string[];
      viewportMode: WebsiteScanSessionState["viewportMode"];
      includeBestPractices: boolean;
      batchId: string;
    }
  | {
      type: "PAGE_VIEWPORT_COMPLETE";
      url: string;
      viewport: "desktop" | "mobile";
      result: WebsitePageScanResult;
    }
  | { type: "SET_REPORT_BRANDING"; branding: Partial<WebsiteScanSessionState["reportBranding"]> }
  | { type: "SET_EXPORT_PREFERENCES"; prefs: Partial<WebsiteScanSessionState["exportPreferences"]> }
  | { type: "RESET" };

function recomputeAggregates(
  pages: WebsitePageEntry[],
  session: WebsiteScanSessionState,
): {
  aggregates: SiteRuleAggregate[] | null;
  siteIntelligence: import("@/features/accessibility-intelligence/types/siteIntelligence").SiteScanIntelligence | null;
  accessibilityWorkspace?: WebsiteScanSessionState["accessibilityWorkspace"];
} {
  const done = collectPageScanResults(pages);
  if (done.length === 0) {
    return { aggregates: null, siteIntelligence: null };
  }
  const preIntel = buildSiteScanIntelligence(done, {
    includeBestPractices: session.includeBestPractices,
    urlsSelected: session.scanScope.urlsSelected,
  });
  const synced = syncSessionHumanReview({
    session,
    completedPages: done,
    intel: preIntel,
  });
  const siteIntelligence = buildSiteScanIntelligence(done, {
    includeBestPractices: session.includeBestPractices,
    humanReviewTasks: synced.humanReviewOpenCount,
    urlsSelected: session.scanScope.urlsSelected,
  });
  const syncedFinal = syncSessionHumanReview({
    session: { ...session, accessibilityWorkspace: synced.workspace },
    completedPages: done,
    intel: siteIntelligence,
  });
  return {
    aggregates: aggregateSiteIssues(done),
    siteIntelligence,
    accessibilityWorkspace: syncedFinal.workspace,
  };
}

function recomputeViewportSummary(
  pages: WebsitePageEntry[],
): WebsiteScanSessionState["viewportComparisonSummary"] {
  const comparisons = pages
    .filter((p) => p.status === "complete" && p.viewportComparison)
    .map((p) => p.viewportComparison!);
  if (comparisons.length === 0) return null;
  return summarizeViewportComparison(comparisons);
}

export function websiteScanReducer(
  state: WebsiteScanSessionState,
  action: WebsiteScanAction,
): WebsiteScanSessionState {
  switch (action.type) {
    case "INIT_CLIENT": {
      const now = new Date().toISOString();
      const ws = state.accessibilityWorkspace ?? createInitialAccessibilityWorkspace();
      return {
        ...state,
        sessionId: action.sessionId,
        highlightFindingId: state.highlightFindingId ?? null,
        accessibilityWorkspace: {
          ...ws,
          workspaceId:
            ws.workspaceId === WORKSPACE_SSR_PLACEHOLDER_ID
              ? action.sessionId
              : ws.workspaceId,
          createdAt:
            ws.createdAt === WORKSPACE_SSR_PLACEHOLDER_TIME ? now : ws.createdAt,
          updatedAt: now,
          humanReviewRecords: ws.humanReviewRecords ?? [],
        },
      };
    }
    case "RESET":
      return { ...createInitialWebsiteSession(), sessionId: state.sessionId };
    case "START_SCAN":
      return {
        ...createInitialWebsiteSession(),
        sessionId: state.sessionId,
        rootUrl: action.rootUrl,
        mode: action.mode,
        viewportId: action.viewportId,
        includeBestPractices: action.includeBestPractices,
        startedAt: new Date().toISOString(),
        status: "validating",
        stageLabel: "Validating URL",
        pages: [
          {
            url: action.rootUrl,
            normalizedKey: action.rootUrl,
            depth: 0,
            status: "queued",
          },
        ],
        crawlQueue: [],
      };
    case "SET_STAGE":
      return {
        ...state,
        stageLabel: action.stageLabel,
        liveMessage: action.liveMessage ?? state.liveMessage,
      };
    case "SET_STATUS":
      return { ...state, status: action.status };
    case "SET_FINAL_ORIGIN":
      return { ...state, finalOrigin: action.origin };
    case "ENQUEUE_PAGES": {
      const seen = new Set(state.pages.map((p) => p.normalizedKey));
      const queue = [...state.crawlQueue];
      const pages = [...state.pages];
      for (const item of action.items) {
        if (item.depth > MAX_CRAWL_DEPTH) continue;
        const key = safeCrawlKey(item.url);
        if (seen.has(key)) continue;
        if (pages.filter((p) => p.status !== "skipped").length >= MAX_SITE_SCAN_PAGES) {
          break;
        }
        seen.add(key);
        pages.push({
          url: item.url,
          normalizedKey: key,
          depth: item.depth,
          status: "queued",
        });
        queue.push(item);
      }
      return { ...state, pages, crawlQueue: queue };
    }
    case "SET_DISCOVERED_TOTAL":
      return { ...state, discoveredTotal: action.count };
    case "PAGE_SCANNING":
      return {
        ...state,
        status: "scanning",
        pages: state.pages.map((p) =>
          p.normalizedKey === safeCrawlKeyFromUrl(action.url) ||
          p.url === action.url
            ? { ...p, status: "scanning" }
            : p,
        ),
      };
    case "PAGE_COMPLETE": {
      const key = safeCrawlKeyFromUrl(action.url);
      const pages = [...state.pages];
      const existingIdx = pages.findIndex(
        (p) => p.normalizedKey === key || p.url === action.url,
      );
      if (existingIdx >= 0) {
        pages[existingIdx] = {
          ...pages[existingIdx],
          status: "complete",
          result: action.result,
        };
      } else {
        pages.push({
          url: action.url,
          normalizedKey: key,
          depth: 0,
          status: "complete",
          result: action.result,
        });
      }
      const scannedCount = pages.filter((p) => p.status === "complete").length;
      const next = {
        ...state,
        pages,
        ...recomputeAggregates(pages, state),
        liveMessage: `Page ${scannedCount} complete.`,
        scanScope: recomputeScope({ ...state, pages }),
      };
      return next;
    }
    case "PAGE_FAILED": {
      const pages = state.pages.map((p) =>
        p.url === action.url
          ? {
              ...p,
              status: "failed" as const,
              errorMessage: action.errorMessage,
            }
          : p,
      );
      return {
        ...state,
        pages,
        status: state.status === "stopping" ? state.status : "partial",
        ...recomputeAggregates(pages, state),
      };
    }
    case "PAGE_SKIPPED": {
      const pages = state.pages.map((p) =>
        p.url === action.url
          ? {
              ...p,
              status: "skipped" as const,
              skipReason: action.reason,
            }
          : p,
      );
      return { ...state, pages, ...recomputeAggregates(pages, state) };
    }
    case "STOP_SCAN":
      return {
        ...state,
        status: "stopping",
        crawlQueue: [],
        liveMessage: "Stopping scan…",
      };
    case "FINISH_SCAN": {
      const complete = state.pages.some((p) => p.status === "complete");
      const failed = state.pages.some((p) => p.status === "failed");
      return {
        ...state,
        status: failed && complete ? "partial" : complete ? "complete" : "failed",
        completedAt: new Date().toISOString(),
        scanRevision: state.scanRevision + 1,
        crawlQueue: [],
        stageLabel: "Complete",
      };
    }
    case "SET_MANUAL_REVIEW": {
      const exists = state.manualReview.some((m) => m.itemId === action.itemId);
      const manualReview = exists
        ? state.manualReview.map((m) =>
            m.itemId === action.itemId
              ? {
                  ...m,
                  status: action.status,
                  note: action.note ?? m.note,
                }
              : m,
          )
        : [
            ...state.manualReview,
            {
              itemId: action.itemId,
              status: action.status,
              note: action.note ?? "",
            },
          ];
      const accessibilityWorkspace = patchManualReviewAndRecords(
        { ...state, manualReview },
        action.itemId,
        action.status,
        action.note,
      );
      const nextState = { ...state, manualReview, accessibilityWorkspace };
      const agg = recomputeAggregates(nextState.pages, nextState);
      return {
        ...nextState,
        ...agg,
      };
    }
    case "SET_AI_GUIDANCE": {
      const aiGuidance = { ...state.aiGuidance };
      for (const g of action.guidance) {
        aiGuidance[g.ruleId] = { ...g, stale: false };
      }
      return { ...state, aiGuidance };
    }
    case "MARK_AI_STALE": {
      const aiGuidance = { ...state.aiGuidance };
      for (const k of Object.keys(aiGuidance)) {
        aiGuidance[k] = { ...aiGuidance[k], stale: true };
      }
      const aiGuidanceByGroup = { ...state.aiGuidanceByGroup };
      for (const k of Object.keys(aiGuidanceByGroup)) {
        aiGuidanceByGroup[k] = { ...aiGuidanceByGroup[k], stale: true };
      }
      const aiRemediationByGroup = { ...state.aiRemediationByGroup };
      for (const k of Object.keys(aiRemediationByGroup)) {
        aiRemediationByGroup[k] = { ...aiRemediationByGroup[k], stale: true };
      }
      return { ...state, aiGuidance, aiGuidanceByGroup, aiRemediationByGroup };
    }
    case "SET_RESULT_VIEW":
      return { ...state, resultView: action.view };
    case "OPEN_HUMAN_REVIEW_CHECK":
      return {
        ...state,
        resultView: "human-review",
        highlightHumanReviewCheckId: action.checkDefinitionId,
      };
    case "FOCUS_FINDING":
      return {
        ...state,
        resultView: "issues",
        highlightFindingId: action.findingId,
      };
    case "SET_ISSUES_GROUP_BY":
      return { ...state, issuesGroupBy: action.groupBy };
    case "OPEN_ISSUES_WITH_FILTER":
      return {
        ...state,
        resultView: "issues",
        issuesFilter: {
          ...state.issuesFilter,
          ...action.filter,
        },
      };
    case "SET_ISSUES_FILTER":
      return { ...state, issuesFilter: action.filter };
    case "SET_EXPLANATION_LEVEL":
      return { ...state, explanationLevel: action.level };
    case "SET_FIX_TASK_STATUS":
      return {
        ...state,
        fixTaskStatus: {
          ...state.fixTaskStatus,
          [action.taskKey]: action.status,
        },
      };
    case "SET_AI_GUIDANCE_GROUP":
      return {
        ...state,
        aiGuidanceByGroup: {
          ...state.aiGuidanceByGroup,
          [action.groupId]: { ...action.guidance, stale: false },
        },
      };
    case "SET_AI_REMEDIATION_GROUP":
      return {
        ...state,
        aiRemediationByGroup: {
          ...state.aiRemediationByGroup,
          [action.groupId]: { ...action.entry, stale: false },
        },
      };
    case "SET_HIGHLIGHT_FIX_TASK":
      return { ...state, highlightFixTaskId: action.taskId };
    case "MERGE_PENDING_CONTRIBUTIONS": {
      let contributions = state.accessibilityWorkspace.contributions;
      for (const c of action.contributions) {
        contributions = upsertContribution(contributions, c);
      }
      return {
        ...state,
        accessibilityWorkspace: {
          ...state.accessibilityWorkspace,
          contributions,
          updatedAt: new Date().toISOString(),
        },
      };
    }
    case "UPSERT_REPORT_CONTRIBUTION":
      return {
        ...state,
        accessibilityWorkspace: {
          ...state.accessibilityWorkspace,
          contributions: upsertContribution(
            state.accessibilityWorkspace.contributions,
            action.contribution,
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    case "SET_CONTRIBUTION_INCLUDED": {
      const contributions = state.accessibilityWorkspace.contributions.map((c) =>
        c.contributionId === action.contributionId
          ? { ...c, includedInReport: action.included, updatedAt: new Date().toISOString() }
          : c,
      );
      return {
        ...state,
        accessibilityWorkspace: {
          ...state.accessibilityWorkspace,
          contributions,
          updatedAt: new Date().toISOString(),
        },
      };
    }
    case "REMOVE_REPORT_CONTRIBUTION":
      return {
        ...state,
        accessibilityWorkspace: {
          ...state.accessibilityWorkspace,
          contributions: state.accessibilityWorkspace.contributions.filter(
            (c) => c.contributionId !== action.contributionId,
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    case "APPLY_RETURN_TO_FINDING":
      return {
        ...state,
        resultView: action.returnTo.resultView ?? "issues",
        issuesFilter: action.returnTo.issuesFilter
          ? { ...state.issuesFilter, ...action.returnTo.issuesFilter }
          : state.issuesFilter,
        highlightFindingId: action.returnTo.highlightFindingId ?? action.returnTo.findingId,
        accessibilityWorkspace: {
          ...state.accessibilityWorkspace,
          returnToFinding: action.returnTo,
        },
      };
    case "SET_INCLUDE_DEV_GUIDANCE_REPORT":
      return {
        ...state,
        includeDeveloperFixGuidanceInReport: action.value,
      };
    case "SET_INCLUDE_AI_REMEDIATION_REPORT":
      return { ...state, includeAiRemediationInReport: action.value };
    case "SET_AI_REMEDIATION_INCLUSION":
      return {
        ...state,
        aiRemediationInclusionById: {
          ...state.aiRemediationInclusionById,
          [action.id]: action.included,
        },
      };
    case "SET_AI_REMEDIATION_INCLUSION_BULK": {
      const next = { ...state.aiRemediationInclusionById };
      for (const id of action.ids) {
        next[id] = action.included;
      }
      return { ...state, aiRemediationInclusionById: next };
    }
    case "SET_SHOW_ALL_MANUAL_CHECKS":
      return { ...state, showAllManualChecks: action.value };
    case "SET_SETUP_PHASE":
      return { ...state, setupPhase: action.phase };
    case "SET_SCAN_SOURCE":
      return { ...state, scanSource: action.source };
    case "SET_VIEWPORT_MODE":
      return {
        ...state,
        viewportMode: action.mode,
        scanWorkload: {
          selectedPages: state.selectedUrlKeys.length,
          viewportsPerPage: action.mode === "compare" ? 2 : 1,
          totalPageEvaluations:
            state.selectedUrlKeys.length * (action.mode === "compare" ? 2 : 1),
        },
      };
    case "SET_DISCOVERY_RESULTS":
      return {
        ...state,
        discoveredUrls: action.urls,
        externalUrlsIgnoredCount: action.externalIgnored,
        discoverySource: action.discoverySource,
        setupPhase: "select_pages",
        scanScope: {
          ...state.scanScope,
          discoverySource: action.discoverySource,
          urlsDiscovered: action.urls.length,
        },
      };
    case "SET_URL_PATTERN_GROUPS":
      return { ...state, urlPatternGroups: action.groups };
    case "SET_SUGGESTED_URL_KEYS":
      return { ...state, suggestedUrlKeys: action.keys };
    case "TOGGLE_URL_SELECTION": {
      const keys = new Set(state.selectedUrlKeys);
      if (keys.has(action.normalizedKey)) {
        keys.delete(action.normalizedKey);
      } else {
        if (keys.size >= MAX_SITE_SCAN_PAGES) return state;
        keys.add(action.normalizedKey);
      }
      const selectedUrlKeys = [...keys];
      return {
        ...state,
        selectedUrlKeys,
        scanWorkload: {
          selectedPages: selectedUrlKeys.length,
          viewportsPerPage: state.viewportMode === "compare" ? 2 : 1,
          totalPageEvaluations:
            selectedUrlKeys.length *
            (state.viewportMode === "compare" ? 2 : 1),
        },
      };
    }
    case "SET_SELECTED_URL_KEYS":
      return {
        ...state,
        selectedUrlKeys: action.keys.slice(0, MAX_SITE_SCAN_PAGES),
        scanWorkload: {
          selectedPages: Math.min(action.keys.length, MAX_SITE_SCAN_PAGES),
          viewportsPerPage: state.viewportMode === "compare" ? 2 : 1,
          totalPageEvaluations:
            Math.min(action.keys.length, MAX_SITE_SCAN_PAGES) *
            (state.viewportMode === "compare" ? 2 : 1),
        },
      };
    case "CLEAR_URL_SELECTION":
      return { ...state, selectedUrlKeys: [], suggestedUrlKeys: [] };
    case "START_BATCH_SCAN": {
      const pages: WebsitePageEntry[] = action.selectedUrls.map((url) => ({
        url,
        normalizedKey: safeCrawlKey(url),
        depth: 0,
        status: "queued" as const,
      }));
      const vpp = action.viewportMode === "compare" ? 2 : 1;
      return {
        ...createInitialWebsiteSession(),
        sessionId: state.sessionId,
        rootUrl: action.rootUrl,
        mode: action.selectedUrls.length > 1 ? "small_site" : "single_page",
        viewportId:
          action.viewportMode === "mobile" ? "mobile" : "desktop",
        viewportMode: action.viewportMode,
        includeBestPractices: action.includeBestPractices,
        startedAt: new Date().toISOString(),
        status: "validating",
        stageLabel: "Preparing scan",
        pages,
        discoveredUrls: state.discoveredUrls,
        selectedUrlKeys: action.selectedUrls.map((u) => safeCrawlKey(u)),
        urlPatternGroups: state.urlPatternGroups,
        discoverySource: state.discoverySource,
        scanSource: state.scanSource,
        siteBatchId: action.batchId,
        setupPhase: "ready_to_scan",
        scanWorkload: {
          selectedPages: action.selectedUrls.length,
          viewportsPerPage: vpp,
          totalPageEvaluations: action.selectedUrls.length * vpp,
        },
        scanScope: {
          ...state.scanScope,
          urlsSelected: action.selectedUrls.length,
          discoverySource: state.discoverySource,
          urlsDiscovered: state.discoveredUrls.length,
        },
      };
    }
    case "PAGE_VIEWPORT_COMPLETE": {
      const key = safeCrawlKeyFromUrl(action.url);
      const pages = state.pages.map((p) => {
        if (p.normalizedKey !== key && p.url !== action.url) return p;
        const next = { ...p, status: "complete" as const };
        if (action.viewport === "desktop") {
          next.desktopResult = action.result;
        } else {
          next.mobileResult = action.result;
        }
        if (next.desktopResult && next.mobileResult) {
          next.viewportComparison = comparePageViewports(
            action.result.finalUrl,
            next.desktopResult,
            next.mobileResult,
          );
          next.result = next.desktopResult;
        } else {
          next.result =
            action.viewport === "desktop"
              ? action.result
              : (next.result ?? action.result);
        }
        return next;
      });
      return {
        ...state,
        pages,
        ...recomputeAggregates(pages, state),
        viewportComparisonSummary: recomputeViewportSummary(pages),
        scanScope: recomputeScope({ ...state, pages }),
      };
    }
    case "SET_REPORT_BRANDING":
      return {
        ...state,
        reportBranding: { ...state.reportBranding, ...action.branding },
      };
    case "SET_EXPORT_PREFERENCES":
      return {
        ...state,
        exportPreferences: { ...state.exportPreferences, ...action.prefs },
      };
    case "SAVE_SNAPSHOT_FOR_COMPARE": {
      const snap = collectPageScanResults(state.pages);
      return { ...state, previousSnapshot: snap };
    }
    default:
      return state;
  }
}
