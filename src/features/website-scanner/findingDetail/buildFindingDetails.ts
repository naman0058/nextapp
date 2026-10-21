import { getRuleKnowledge } from "@/features/accessibility-intelligence/knowledge/ruleKnowledge";
import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { NormalizedAccessibilityFinding } from "@/features/accessibility-intelligence/types/normalizedFinding";
import { isDeveloperTicketEligibleForRootCause } from "@/features/website-scanner/developerTicket/isDeveloperTicketEligible";
import {
  buildPageViewportScopes,
  collectRetainedEvidenceForRule,
} from "@/features/website-scanner/findingDetail/collectPageEvidence";
import { isClientAiRemediationAvailable } from "@/features/website-scanner/remediation/clientAiRemediation";
import {
  getDeterministicRemediation,
  hasFullDeterministicRemediation,
} from "@/features/website-scanner/remediation/registry";
import type {
  FindingDetail,
  RelatedIncompleteSummary,
  WcagMappingDetail,
} from "@/features/website-scanner/findingDetail/types";
import { specializedToolForRule } from "@/features/website-scanner/findingDetail/specializedToolRoutes";
import { relatedHumanReviewCheckIdsForRule } from "@/features/website-scanner/findingDetail/relatedHumanReviewChecks";
import { primaryCategoryForRule } from "@/features/website-scanner/taxonomy/ruleCategoryMap";
import type {
  ScanResultOutcome,
  ScanResultSource,
} from "@/features/website-scanner/taxonomy/types";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

function mapSource(finding: NormalizedAccessibilityFinding | undefined): ScanResultSource {
  if (!finding) return "AXE_WCAG";
  if (finding.sourceType === "deterministic_rule") return "DETERMINISTIC";
  if (finding.sourceType === "human_review") return "MANUAL";
  if (finding.bestPractice) return "AXE_BEST_PRACTICE";
  return "AXE_WCAG";
}

function wcagMappingsForRule(
  ruleId: string,
  intel: Pick<SiteScanIntelligence, "wcagCoverage" | "normalizedFindings">,
): WcagMappingDetail[] {
  const fromMatrix = intel.wcagCoverage.filter((c) =>
    c.automatedRules.includes(ruleId),
  );
  if (fromMatrix.length > 0) {
    return fromMatrix.map((c) => ({
      criterion: c.criterion,
      title: c.name,
      level: c.level,
      relationNote: "Automated rule maps to this criterion; pass/fail is rule-scoped, not full criterion compliance.",
    }));
  }
  const sample = intel.normalizedFindings.find((f) => f.ruleId === ruleId);
  const criteria = sample?.wcagCriteria ?? [];
  return criteria.map((criterion) => ({
    criterion,
    level: sample?.wcagLevel ?? "AA",
  }));
}

function relatedIncompleteForRule(
  ruleId: string,
  findings: NormalizedAccessibilityFinding[],
): RelatedIncompleteSummary[] {
  const incomplete = findings.filter(
    (f) =>
      f.ruleId === ruleId &&
      f.status === "review" &&
      f.humanReviewRequired &&
      f.sourceType === "axe",
  );
  if (incomplete.length === 0) return [];
  const totalOccurrences = incomplete.reduce(
    (n, f) => n + (f.occurrenceCount ?? 1),
    0,
  );
  const retainedEvidenceCount = incomplete.reduce(
    (n, f) => n + f.evidence.length,
    0,
  );
  return [
    {
      findingId: incomplete[0]!.id,
      ruleId,
      title: incomplete[0]!.title,
      totalOccurrences,
      retainedEvidenceCount,
      affectedUrls: [...new Set(incomplete.map((f) => f.pageUrl).filter(Boolean))] as string[],
      affectedViewports: [
        ...new Set(
          incomplete
            .map((f) => f.viewportId)
            .filter((v): v is "desktop" | "mobile" => v === "desktop" || v === "mobile"),
        ),
      ],
      explanation: incomplete[0]?.description,
    },
  ];
}

function sampleFindingForGroup(
  groupId: string | undefined,
  ruleId: string,
  findings: NormalizedAccessibilityFinding[],
): NormalizedAccessibilityFinding | undefined {
  if (groupId) {
    const byGroup = findings.find((f) => f.rootCauseGroupId === groupId);
    if (byGroup) return byGroup;
  }
  return findings.find((f) => f.ruleId === ruleId && f.status === "issue");
}

function buildFromRootCauseGroup(
  pages: WebsitePageScanResult[],
  intel: SiteScanIntelligence,
  groupId: string,
): FindingDetail | null {
  const group = intel.rootCauseGroups.find((g) => g.id === groupId);
  if (!group) return null;

  const agg = intel.ruleAggregates.find((r) => r.ruleId === group.ruleId);
  const isBestPractice = agg?.isBestPractice ?? false;
  const linked = intel.normalizedFindings.filter(
    (f) => f.rootCauseGroupId === group.id || f.ruleId === group.ruleId,
  );
  const issueFindings = linked.filter((f) => f.status === "issue");
  const sample = sampleFindingForGroup(group.id, group.ruleId, issueFindings) ?? issueFindings[0];

  const evidenceItems = collectRetainedEvidenceForRule(pages, group.ruleId, {
    bestPractice: isBestPractice,
  });
  const pageViewportScopes = buildPageViewportScopes(pages, group.ruleId, {
    bestPractice: isBestPractice,
  });

  const knowledge = getRuleKnowledge(group.ruleId);
  const outcome: ScanResultOutcome = isBestPractice ? "FAIL" : "FAIL";
  const kind = isBestPractice ? "best_practice" : "automated_failure";

  const affectedViewports = [
    ...new Set(pageViewportScopes.map((s) => s.viewportId)),
  ] as ("desktop" | "mobile")[];

  return {
    findingId: group.id,
    remediationGroupId: group.id,
    ruleId: group.ruleId,
    title: knowledge?.plainTitle ?? sample?.title ?? group.label,
    description: sample?.description ?? group.label,
    helpUrl: sample?.recommendation?.startsWith("http")
      ? sample.recommendation
      : undefined,
    kind,
    source: mapSource(sample),
    outcome,
    category: primaryCategoryForRule(group.ruleId, isBestPractice),
    isBestPractice,
    impact: sample?.impact ?? agg?.impact ?? "unknown",
    priority: sample?.priority ?? "medium",
    wcagMappings: wcagMappingsForRule(group.ruleId, intel),
    totalOccurrences: group.totalOccurrences,
    retainedEvidenceCount: group.retainedEvidenceCount,
    displayedSelectorCount: group.representativeSelectors.length,
    pagesAffected: group.affectedPages.length,
    affectedUrls: [...group.affectedPages],
    affectedViewports,
    representativeSelectors: group.representativeSelectors,
    evidenceItems:
      evidenceItems.length > 0
        ? evidenceItems
        : group.representativeEvidence.map((e, idx) => ({
            evidenceId: `${group.id}-rep-${idx}`,
            pageUrl: group.affectedPages[0] ?? "",
            viewportId: "desktop" as const,
            selector: e.selector,
            htmlSnippet: e.htmlSnippet,
            failureSummary: e.evidenceText,
            measurement: e.measurement,
            occurrenceIndex: idx + 1,
          })),
    pageViewportScopes,
    relatedIncomplete: relatedIncompleteForRule(group.ruleId, intel.normalizedFindings),
    relatedManualTasks: relatedHumanReviewCheckIdsForRule(group.ruleId),
    relatedHumanReviewCheckIds: relatedHumanReviewCheckIdsForRule(group.ruleId),
    deterministicFixAvailable: hasFullDeterministicRemediation(group.ruleId),
    aiRemediationAvailable: isClientAiRemediationAvailable(),
    visualLocatorAvailable: !isBestPractice && group.affectedPages.length > 0,
    developerTicketAvailable: isDeveloperTicketEligibleForRootCause(group),
    specializedTool:
      getDeterministicRemediation(group.ruleId)?.specializedTool ??
      specializedToolForRule(group.ruleId),
    normalizedFindings: issueFindings.length ? issueFindings : linked,
  };
}

function buildIncompleteOnlyDetails(
  pages: WebsitePageScanResult[],
  intel: SiteScanIntelligence,
): FindingDetail[] {
  const failureRuleIds = new Set(
    intel.normalizedFindings
      .filter((f) => f.status === "issue" && !f.bestPractice)
      .map((f) => f.ruleId)
      .filter(Boolean) as string[],
  );

  const incompleteFindings = intel.normalizedFindings.filter(
    (f) =>
      f.status === "review" &&
      f.humanReviewRequired &&
      f.sourceType === "axe" &&
      f.ruleId,
  );

  const byRule = new Map<string, NormalizedAccessibilityFinding[]>();
  for (const f of incompleteFindings) {
    const id = f.ruleId!;
    const list = byRule.get(id) ?? [];
    list.push(f);
    byRule.set(id, list);
  }

  const details: FindingDetail[] = [];
  for (const [ruleId, rows] of byRule) {
    if (failureRuleIds.has(ruleId)) continue;
    const evidenceItems = collectRetainedEvidenceForRule(pages, ruleId, {
      incomplete: true,
    });
    const pageViewportScopes = buildPageViewportScopes(pages, ruleId, {
      incomplete: true,
    });
    const totalOccurrences = rows.reduce(
      (n, f) => n + (f.occurrenceCount ?? 1),
      0,
    );
    const retainedEvidenceCount = Math.max(
      evidenceItems.length,
      rows.reduce((n, f) => n + f.evidence.length, 0),
    );
    const affectedUrls = [...new Set(rows.map((f) => f.pageUrl).filter(Boolean))] as string[];
    const reg = getDeterministicRemediation(ruleId);

    details.push({
      findingId: `incomplete:${ruleId}`,
      ruleId,
      title: reg?.title ?? rows[0]!.title,
      description: rows[0]!.description,
      kind: "incomplete_only",
      source: "AXE_WCAG",
      outcome: "INCOMPLETE",
      category: primaryCategoryForRule(ruleId, false),
      isBestPractice: false,
      impact: rows[0]!.impact,
      priority: rows[0]!.priority,
      wcagMappings: wcagMappingsForRule(ruleId, intel),
      totalOccurrences,
      retainedEvidenceCount,
      displayedSelectorCount: evidenceItems.filter((e) => e.selector).length,
      pagesAffected: affectedUrls.length,
      affectedUrls,
      affectedViewports: [
        ...new Set(
          rows
            .map((f) => f.viewportId)
            .filter((v): v is "desktop" | "mobile" => v === "desktop" || v === "mobile"),
        ),
      ],
      representativeSelectors: evidenceItems
        .map((e) => e.selector)
        .filter((s): s is string => Boolean(s))
        .slice(0, 5),
      evidenceItems,
      pageViewportScopes,
      relatedIncomplete: [],
      relatedManualTasks: relatedHumanReviewCheckIdsForRule(ruleId, {
        includeIncompleteMapping: true,
      }),
      relatedHumanReviewCheckIds: relatedHumanReviewCheckIdsForRule(ruleId, {
        includeIncompleteMapping: true,
      }),
      deterministicFixAvailable: hasFullDeterministicRemediation(ruleId),
      aiRemediationAvailable: isClientAiRemediationAvailable(),
      visualLocatorAvailable: false,
      developerTicketAvailable: true,
      specializedTool:
        getDeterministicRemediation(ruleId)?.specializedTool ??
        specializedToolForRule(ruleId),
      normalizedFindings: rows,
    });
  }
  return details;
}

export function buildFindingDetails(
  pages: WebsitePageScanResult[],
  intel: SiteScanIntelligence,
): FindingDetail[] {
  const fromGroups = intel.rootCauseGroups
    .map((g) => buildFromRootCauseGroup(pages, intel, g.id))
    .filter((d): d is FindingDetail => d !== null);

  const groupRuleIds = new Set(fromGroups.map((d) => d.ruleId));
  const incompleteOnly = buildIncompleteOnlyDetails(pages, intel).filter(
    (d) => !groupRuleIds.has(d.ruleId),
  );

  const bestPractice = buildBestPracticeDetails(pages, intel);
  return [...fromGroups, ...incompleteOnly, ...bestPractice];
}

function buildBestPracticeDetails(
  pages: WebsitePageScanResult[],
  intel: SiteScanIntelligence,
): FindingDetail[] {
  const byRule = new Map<string, NormalizedAccessibilityFinding[]>();
  for (const f of intel.normalizedFindings) {
    if (f.status !== "issue" || !f.bestPractice || !f.ruleId) continue;
    const list = byRule.get(f.ruleId) ?? [];
    list.push(f);
    byRule.set(f.ruleId, list);
  }

  const details: FindingDetail[] = [];
  for (const [ruleId, rows] of byRule) {
    const evidenceItems = collectRetainedEvidenceForRule(pages, ruleId, {
      bestPractice: true,
    });
    const pageViewportScopes = buildPageViewportScopes(pages, ruleId, {
      bestPractice: true,
    });
    const totalOccurrences = rows.reduce(
      (n, f) => n + (f.occurrenceCount ?? 1),
      0,
    );
    const affectedUrls = [...new Set(rows.map((f) => f.pageUrl).filter(Boolean))] as string[];
    const knowledge = getRuleKnowledge(ruleId);
    const selectors = evidenceItems
      .map((e) => e.selector)
      .filter((s): s is string => Boolean(s));

    details.push({
      findingId: `best-practice:${ruleId}`,
      ruleId,
      title: knowledge?.plainTitle ?? rows[0]!.title,
      description: rows[0]!.description,
      kind: "best_practice",
      source: "AXE_BEST_PRACTICE",
      outcome: "FAIL",
      category: primaryCategoryForRule(ruleId, true),
      isBestPractice: true,
      impact: rows[0]!.impact,
      priority: rows[0]!.priority,
      wcagMappings: wcagMappingsForRule(ruleId, intel),
      totalOccurrences,
      retainedEvidenceCount: evidenceItems.length,
      displayedSelectorCount: selectors.length,
      pagesAffected: affectedUrls.length,
      affectedUrls,
      affectedViewports: [
        ...new Set(
          rows
            .map((f) => f.viewportId)
            .filter((v): v is "desktop" | "mobile" => v === "desktop" || v === "mobile"),
        ),
      ],
      representativeSelectors: selectors.slice(0, 5),
      evidenceItems,
      pageViewportScopes,
      relatedIncomplete: [],
      relatedManualTasks: relatedHumanReviewCheckIdsForRule(ruleId),
      relatedHumanReviewCheckIds: relatedHumanReviewCheckIdsForRule(ruleId),
      deterministicFixAvailable: hasFullDeterministicRemediation(ruleId),
      aiRemediationAvailable: isClientAiRemediationAvailable(),
      visualLocatorAvailable: false,
      developerTicketAvailable: true,
      specializedTool:
        getDeterministicRemediation(ruleId)?.specializedTool ??
        specializedToolForRule(ruleId),
      normalizedFindings: rows,
    });
  }
  return details;
}

export function findingDetailById(
  details: FindingDetail[],
  id: string,
): FindingDetail | undefined {
  return details.find((d) => d.findingId === id || d.remediationGroupId === id);
}
