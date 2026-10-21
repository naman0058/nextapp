import type {
  FixPlanItem,
  RootCauseGroup,
} from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { NormalizedAccessibilityFinding } from "@/features/accessibility-intelligence/types/normalizedFinding";
import { getUserImpactForRule } from "@/features/accessibility-intelligence/knowledge/ruleKnowledge";
import {
  buildDeterministicGuidanceStrings,
  getDeterministicRemediation,
  hasFullDeterministicRemediation,
} from "@/features/website-scanner/remediation/registry";
import type { RemediationFacts } from "@/lib/ai/remediation/types";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { ViewportScanMode } from "@/features/website-scanner/types/websiteDiscovery";

export type BuildWebsiteRemediationContextInput = {
  group: RootCauseGroup;
  fixPlanItem?: FixPlanItem;
  completedPages: WebsitePageScanResult[];
  viewportMode: ViewportScanMode;
  normalizedFindings?: NormalizedAccessibilityFinding[];
};

export type WebsiteRemediationContext = {
  facts: RemediationFacts;
  deterministicGuidance: string[];
};

function sampleViolation(
  group: RootCauseGroup,
  completedPages: WebsitePageScanResult[],
) {
  for (const page of completedPages) {
    const v = page.violations.find((x) => x.id === group.ruleId);
    if (v) return { violation: v, page };
  }
  return { violation: undefined, page: undefined };
}

function viewportContextLabel(
  viewportMode: ViewportScanMode,
  findings: NormalizedAccessibilityFinding[] | undefined,
  groupId: string,
): string {
  const related = findings?.filter((f) => f.rootCauseGroupId === groupId) ?? [];
  const viewports = new Set(related.map((f) => f.viewportId).filter(Boolean));
  if (viewports.size === 1) {
    const only = [...viewports][0];
    return only === "mobile" ? "Issue observed on mobile viewport" : "Issue observed on desktop viewport";
  }
  if (viewportMode === "compare") {
    return "Desktop and mobile viewports were scanned; compare if behavior differs.";
  }
  if (viewportMode === "mobile") return "Mobile viewport scan";
  return "Desktop viewport scan";
}

function contrastFactsFromFindings(
  findings: NormalizedAccessibilityFinding[] | undefined,
  groupId: string,
): Record<string, unknown> | undefined {
  const f = findings?.find(
    (x) => x.rootCauseGroupId === groupId && x.ruleId === "color-contrast",
  );
  if (!f) return undefined;
  const m = f.evidence
    .flatMap((e) => (e.measurement ? [e.measurement] : []))
    .find((x) => x.name.toLowerCase().includes("contrast") || x.unit === "ratio");
  if (!m) {
    const text = f.evidence.map((e) => e.evidenceText).filter(Boolean)[0];
    return text ? { contrastEvidenceText: text } : undefined;
  }
  return {
    foregroundBackgroundContrast: {
      measuredRatio: m.value,
      requiredThreshold: m.threshold,
      unit: m.unit ?? "ratio",
      authoritative: true,
      doNotRecalculate: true,
    },
  };
}

export function buildWebsiteRemediationContext(
  input: BuildWebsiteRemediationContextInput,
): WebsiteRemediationContext {
  const { group, fixPlanItem, completedPages, viewportMode, normalizedFindings } =
    input;
  const remediation = getDeterministicRemediation(group.ruleId);
  const { violation } = sampleViolation(group, completedPages);

  const htmlSnippets = group.representativeEvidence
    .map((e) => e.htmlSnippet)
    .filter(Boolean)
    .slice(0, 3) as string[];

  const selectors = [
    ...group.representativeSelectors,
    ...group.representativeEvidence
      .map((e) => e.selector)
      .filter(Boolean),
  ]
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, 5) as string[];

  const wcagCriteria =
    violation?.wcagCriteria ??
    normalizedFindings?.find((f) => f.rootCauseGroupId === group.id)?.wcagCriteria ??
    [];

  const relatedFinding = normalizedFindings?.find(
    (f) => f.rootCauseGroupId === group.id,
  );

  const facts: RemediationFacts = {
    source: "website",
    issueFingerprint: group.id,
    ruleId: group.ruleId,
    impact: violation?.impact ?? fixPlanItem?.impact ?? "unknown",
    remediationPriority: fixPlanItem?.priority,
    wcagCriteria,
    userImpact: getUserImpactForRule(group.ruleId, group.label),
    rootCauseLabel: group.label,
    rootCauseDescription: `${group.totalOccurrences} occurrence(s) across ${group.affectedPages.length} page(s).`,
    likelySharedComponent: group.likelySharedComponent,
    groupType: group.groupType,
    affectedPageCount: group.affectedPages.length,
    affectedElementCount: group.totalOccurrences,
    viewportContext: viewportContextLabel(viewportMode, normalizedFindings, group.id),
    htmlSnippets,
    selectors,
    findingClassification:
      relatedFinding?.bestPractice === true
        ? "best_practice"
        : relatedFinding?.humanReviewRequired || relatedFinding?.status === "review"
          ? "human_review_required"
          : violation
            ? "automated_violation"
            : "automated_violation",
    humanReviewRequired: Boolean(
      relatedFinding?.humanReviewRequired ||
        relatedFinding?.status === "review" ||
        violation === undefined,
    ),
    imageContextAvailable: group.ruleId === "image-alt" ? htmlSnippets.length > 0 : undefined,
    documentLevelIssue: ["html-has-lang", "document-title"].includes(group.ruleId),
  };

  const contrastExtra = contrastFactsFromFindings(normalizedFindings, group.id);
  if (contrastExtra) {
    Object.assign(facts, contrastExtra);
  }

  const deterministicGuidance: string[] = [];
  if (remediation && hasFullDeterministicRemediation(group.ruleId)) {
    deterministicGuidance.push(...buildDeterministicGuidanceStrings(remediation));
  }
  if (group.likelySharedComponent) {
    deterministicGuidance.push(
      "Because this pattern appears repeatedly, review the shared navigation/component implementation if one exists.",
    );
  }
  if (deterministicGuidance.length === 0) {
    deterministicGuidance.push(
      `Automated rule ${group.ruleId}: apply axe guidance for this rule and verify with rescan and manual checks where needed.`,
    );
  }

  return { facts, deterministicGuidance };
}
