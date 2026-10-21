import type { AccessibilityEvidence } from "@/features/accessibility-intelligence/types/evidence";
import type { NormalizedAccessibilityFinding } from "@/features/accessibility-intelligence/types/normalizedFinding";
import {
  getUserImpactForRule,
  getVerificationStepsForRule,
  getRuleKnowledge,
} from "@/features/accessibility-intelligence/knowledge/ruleKnowledge";
import { computeRemediationPriority } from "@/features/accessibility-intelligence/priority/remediationPriority";
import type {
  WebsiteAccessibilityIncomplete,
  WebsiteAccessibilityViolation,
  WebsitePageScanResult,
} from "@/features/website-scanner/types/scanTypes";

function axeEvidence(
  ruleId: string,
  page: WebsitePageScanResult,
  node?: { selectorLabel: string; htmlSnippet?: string },
  wcagCriteria?: string[],
): AccessibilityEvidence {
  return {
    sourceType: "axe",
    sourceId: ruleId,
    engine: "axe-core",
    engineVersion: page.axeVersion,
    wcagCriteria,
    selector: node?.selectorLabel,
    htmlSnippet: node?.htmlSnippet,
    confidenceCategory: "tool_detected",
  };
}

function adaptViolation(
  v: WebsiteAccessibilityViolation,
  page: WebsitePageScanResult,
  rootCauseGroupId?: string,
): NormalizedAccessibilityFinding {
  const knowledge = getRuleKnowledge(v.id);
  const { priority, reasonForPriority } = computeRemediationPriority({
    impact: v.impact,
    occurrenceCount: v.totalNodeCount,
    affectedPageCount: 1,
    likelySharedComponent: false,
    sharedConfidence: "low",
    wcagLevel: v.level === "A" || v.level === "AA" ? v.level : null,
    humanReviewRequired: false,
  });
  void reasonForPriority;

  const viewportKey = page.viewport.id;
  return {
    id: `${page.finalUrl}::${viewportKey}::${v.id}`,
    sourceType: "axe",
    category: "website_automation",
    title: knowledge?.plainTitle ?? v.help,
    status: "issue",
    impact: v.impact,
    priority,
    confidence: "high",
    description: v.description,
    userImpact: getUserImpactForRule(v.id, v.help),
    recommendation: v.helpUrl ?? knowledge?.deterministicFixTemplate?.genericPattern,
    verificationSteps: getVerificationStepsForRule(v.id),
    wcagCriteria: v.isBestPractice ? [] : v.wcagCriteria,
    wcagLevel: v.level === "A" || v.level === "AA" ? v.level : null,
    bestPractice: v.isBestPractice,
    evidence: [
      axeEvidence(v.id, page, v.nodes[0], v.wcagCriteria),
      ...v.nodes.slice(1, 3).map((n) => axeEvidence(v.id, page, n, v.wcagCriteria)),
    ],
    pageUrl: page.finalUrl,
    affectedElementCount: v.totalNodeCount,
    occurrenceCount: v.totalNodeCount,
    rootCauseGroupId,
    humanReviewRequired: false,
    ruleId: v.id,
    viewportId: page.viewport.id,
  };
}

function adaptIncomplete(
  inc: WebsiteAccessibilityIncomplete,
  page: WebsitePageScanResult,
  automatedViolationForSameRule: boolean,
): NormalizedAccessibilityFinding {
  const manualTitle = automatedViolationForSameRule
    ? `Needs manual confirmation: ${inc.help}`
    : inc.help;
  return {
    id: `${page.finalUrl}::${page.viewport.id}::${inc.id}::incomplete`,
    sourceType: "axe",
    category: "website_automation",
    title: manualTitle,
    status: "review",
    impact: inc.impact,
    priority: "medium",
    confidence: "human_required",
    description: automatedViolationForSameRule
      ? `Axe could not determine this condition automatically for some elements on this page (separate from automated failures already reported for this rule). Manual confirmation is required for those cases. ${inc.description}`
      : inc.description,
    userImpact: getUserImpactForRule(inc.id, inc.help),
    wcagCriteria: inc.wcagCriteria,
    wcagLevel: inc.level === "A" || inc.level === "AA" ? inc.level : null,
    evidence: [axeEvidence(inc.id, page, inc.nodes[0], inc.wcagCriteria)],
    pageUrl: page.finalUrl,
    occurrenceCount: inc.totalNodeCount,
    humanReviewRequired: true,
    ruleId: inc.id,
    viewportId: page.viewport.id,
  };
}

export function adaptAxePageToFindings(
  page: WebsitePageScanResult,
  rootCauseByRule?: Map<string, string>,
): NormalizedAccessibilityFinding[] {
  const findings: NormalizedAccessibilityFinding[] = [];
  const violationRuleIds = new Set(
    page.violations.filter((v) => !v.isBestPractice).map((v) => v.id),
  );
  for (const v of page.violations) {
    findings.push(
      adaptViolation(v, page, rootCauseByRule?.get(v.id)),
    );
  }
  for (const inc of page.incomplete) {
    findings.push(
      adaptIncomplete(inc, page, violationRuleIds.has(inc.id)),
    );
  }
  return findings;
}
