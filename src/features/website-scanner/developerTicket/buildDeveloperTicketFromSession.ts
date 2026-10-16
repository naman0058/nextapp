import type { FixPlanItem, RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { NormalizedAccessibilityFinding } from "@/features/accessibility-intelligence/types/normalizedFinding";
import { buildDeveloperTicket } from "@/features/website-scanner/developerTicket/buildDeveloperTicket";
import { buildDeveloperTicketScanContext } from "@/features/website-scanner/developerTicket/buildDeveloperTicketScanContext";
import type { DeveloperTicket } from "@/features/website-scanner/developerTicket/types";
import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { resolveDisplayFixStatus } from "@/features/website-scanner/utils/fixWorkflowStatus";
import { fixTaskKeyForRootCause } from "@/features/website-scanner/utils/fixTaskKeys";
import { formatAiRemediationForTicket } from "@/features/website-scanner/developerTicket/formatAiRemediationForTicket";

function viewportDetailForRule(
  ruleId: string,
  completedPages: WebsitePageScanResult[],
): string | undefined {
  let desktop = 0;
  let mobile = 0;
  for (const page of completedPages) {
    const countRule = (v: { id: string; totalNodeCount: number }[]) =>
      v.filter((x) => x.id === ruleId).reduce((n, x) => n + x.totalNodeCount, 0);
    if (page.viewport.id === "desktop") desktop += countRule(page.violations);
    if (page.viewport.id === "mobile") mobile += countRule(page.violations);
  }
  if (desktop > 0 && mobile === 0) return "Detected in desktop viewport only.";
  if (mobile > 0 && desktop === 0) return "Detected in mobile viewport only.";
  if (desktop > 0 && mobile > 0) {
    return `Desktop: ${desktop} occurrence(s); Mobile: ${mobile} occurrence(s).`;
  }
  return undefined;
}

function estimatePreviousOccurrences(
  previous: WebsitePageScanResult[],
  ruleId: string,
): number {
  let n = 0;
  for (const page of previous) {
    for (const v of page.violations) {
      if (v.id === ruleId) n += v.totalNodeCount;
    }
  }
  return n;
}

export function buildDeveloperTicketForRootCause(input: {
  group: RootCauseGroup;
  completedPages: WebsitePageScanResult[];
  session: WebsiteScanSessionState;
  fixPlanItem?: FixPlanItem;
  axeHelp: string;
  includeAiGuidance?: boolean;
  displayFixStatus?: string;
}): DeveloperTicket {
  const { group, session, completedPages, fixPlanItem, axeHelp } = input;
  const taskKey = fixTaskKeyForRootCause(group.id);
  const userStatus = session.fixTaskStatus[taskKey] ?? "not_started";
  const verificationStatus =
    input.displayFixStatus ??
    resolveDisplayFixStatus({
      taskKey,
      userStatus,
      ruleId: group.ruleId,
      previousSnapshot: session.previousSnapshot,
      currentPages: completedPages,
      rootCauseGroup: group,
    });

  let verificationOccurrenceDelta: string | undefined;
  if (session.previousSnapshot?.length) {
    const prev = estimatePreviousOccurrences(session.previousSnapshot, group.ruleId);
    const now = group.totalOccurrences;
    if (prev > now) {
      verificationOccurrenceDelta = `${prev} → ${now} occurrences`;
    }
  }

  const finding = session.siteIntelligence?.normalizedFindings.find(
    (f) => f.rootCauseGroupId === group.id,
  );
  const aggregate = session.siteIntelligence?.ruleAggregates.find(
    (r) => r.ruleId === group.ruleId,
  );

  const impact = fixPlanItem?.impact ?? aggregate?.impact ?? finding?.impact ?? "unknown";
  const priority = fixPlanItem?.priority ?? finding?.priority ?? "medium";
  const wcagCriteria = finding?.wcagCriteria ?? aggregate?.wcagCriteria ?? [];
  const wcagLevel = finding?.wcagLevel ?? null;
  const bestPractice = finding?.bestPractice ?? aggregate?.isBestPractice;

  const scanContext = buildDeveloperTicketScanContext(
    session,
    completedPages,
    verificationStatus,
    verificationOccurrenceDelta,
  );

  const ai =
    input.includeAiGuidance && session.aiRemediationByGroup[group.id]
      ? formatAiRemediationForTicket(session.aiRemediationByGroup[group.id].report)
      : undefined;

  return buildDeveloperTicket({
    ruleId: group.ruleId,
    axeHelp,
    impact,
    priority,
    bestPractice,
    humanReviewRequired: finding?.humanReviewRequired ?? false,
    sourceType: finding?.sourceType ?? "axe",
    wcagCriteria,
    wcagLevel,
    rootCause: {
      label: group.label,
      confidence: group.confidence,
      likelySharedComponent: group.likelySharedComponent,
      affectedPages: group.affectedPages,
      totalOccurrences: group.totalOccurrences,
      representativeSelectors: group.representativeSelectors,
      representativeEvidence: group.representativeEvidence.map((e, i) => ({
        selector: e.selector,
        htmlSnippet: e.htmlSnippet,
        failureSummary: e.evidenceText,
        pageUrl: group.affectedPages[i] ?? group.affectedPages[0] ?? finding?.pageUrl,
      })),
    },
    scanContext,
    viewportDetail: viewportDetailForRule(group.ruleId, completedPages),
    aiGuidance: ai
      ? {
          plainLanguageExplanation: ai.plainLanguageExplanation,
          suggestedFixes: ai.suggestedFixes,
          developerExample: ai.developerExample,
        }
      : undefined,
  });
}

export function buildDeveloperTicketForFinding(input: {
  finding: NormalizedAccessibilityFinding;
  completedPages: WebsitePageScanResult[];
  session: WebsiteScanSessionState;
  axeHelp?: string;
  includeAiGuidance?: boolean;
}): DeveloperTicket {
  const { finding, session, completedPages } = input;
  const scanContext = buildDeveloperTicketScanContext(session, completedPages);
  const ruleId = finding.ruleId ?? finding.id;
  const ai =
    input.includeAiGuidance && session.aiGuidance[ruleId]
      ? session.aiGuidance[ruleId]
      : undefined;

  return buildDeveloperTicket({
    ruleId,
    axeHelp: input.axeHelp ?? finding.title,
    impact: finding.impact,
    priority: finding.priority,
    bestPractice: finding.bestPractice,
    humanReviewRequired: finding.humanReviewRequired,
    sourceType: finding.sourceType,
    wcagCriteria: finding.wcagCriteria ?? [],
    wcagLevel: finding.wcagLevel ?? null,
    findingFallback: {
      title: finding.title,
      description: finding.description,
      pageUrl: finding.pageUrl,
      occurrenceCount: finding.occurrenceCount ?? finding.affectedElementCount,
      evidence: finding.evidence.map((e) => ({
        selector: e.selector,
        htmlSnippet: e.htmlSnippet,
        failureSummary: e.evidenceText,
      })),
    },
    scanContext,
    aiGuidance: ai
      ? {
          plainLanguageExplanation: ai.plainLanguageExplanation,
          suggestedFixes: ai.suggestedFixes,
          developerExample: ai.developerExample,
        }
      : undefined,
  });
}

export function buildAllDeveloperTicketsFromSession(
  session: WebsiteScanSessionState,
  completedPages: WebsitePageScanResult[],
): DeveloperTicket[] {
  const groups = session.siteIntelligence?.rootCauseGroups ?? [];
  const plan = session.siteIntelligence?.fixPlan ?? [];
  return groups.map((group) => {
    const item = plan.find((p) => p.rootCauseGroupId === group.id);
    return buildDeveloperTicketForRootCause({
      group,
      completedPages,
      session,
      fixPlanItem: item,
      axeHelp: item?.title ?? group.label,
    });
  });
}
