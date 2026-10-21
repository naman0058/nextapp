import type { AxeResults } from "axe-core";
import {
  MAX_AXE_NODES_PER_RULE,
  MAX_HTML_SNIPPET_CHARS,
  MAX_TOTAL_REPORTED_NODES_PER_PAGE,
} from "@/features/website-scanner/constants/scanLimits";
import { AXE_BEST_PRACTICE_TAG } from "@/features/website-scanner/constants/axeScanConfig";
import { formatAxeTarget } from "@/features/website-scanner/server/axe/formatSelector";
import {
  deriveRuleLevel,
  extractWcagCriteria,
  isBestPracticeRule,
} from "@/features/website-scanner/server/axe/wcagFromTags";
import { buildDomSignature } from "@/features/accessibility-intelligence/grouping/domSignature";
import { sanitizeHtmlSnippet } from "@/features/accessibility-intelligence/evidence/sanitizeHtmlSnippet";
import { inferLandmarkFromSelector } from "@/features/accessibility-intelligence/evidence/inferLandmarkFromSelector";
import { selectRepresentativeNodes } from "@/features/accessibility-intelligence/evidence/selectRepresentativeNodes";
import type { AxeEvaluatedRuleRecord } from "@/features/website-scanner/taxonomy/types";
import type {
  AxeImpact,
  ElementContextSummary,
  PageAccessibilitySummary,
  WebsiteAccessibilityIncomplete,
  WebsiteAccessibilityViolation,
  WebsiteViolationNode,
} from "@/features/website-scanner/types/scanTypes";

function mapImpact(impact: string | null | undefined): AxeImpact {
  if (
    impact === "critical" ||
    impact === "serious" ||
    impact === "moderate" ||
    impact === "minor"
  ) {
    return impact;
  }
  return "unknown";
}

function truncateSnippet(html: string | undefined): string | undefined {
  if (!html) return undefined;
  const trimmed = html.replace(/\s+/g, " ").trim();
  const sanitized = sanitizeHtmlSnippet(trimmed) ?? trimmed;
  if (sanitized.length <= MAX_HTML_SNIPPET_CHARS) return sanitized;
  return `${sanitized.slice(0, MAX_HTML_SNIPPET_CHARS)}…`;
}

function parseElementContext(html: string | undefined): ElementContextSummary {
  if (!html) return {};
  const tagMatch = /^<\s*([a-zA-Z0-9-]+)/.exec(html);
  const roleMatch = /role\s*=\s*["']([^"']+)["']/i.exec(html);
  const idMatch = /\sid\s*=\s*["']([^"']+)["']/i.exec(html);
  const classMatch = /class\s*=\s*["']([^"']+)["']/i.exec(html);
  const classes = classMatch?.[1]
    ?.split(/\s+/)
    .filter((c) => c && !/^[a-z]{1,4}-[a-z0-9]{5,}$/i.test(c))
    .slice(0, 5);
  return {
    tag: tagMatch?.[1]?.toLowerCase(),
    role: roleMatch?.[1],
    hasAriaLabel: /aria-label\s*=/i.test(html),
    stableId: idMatch?.[1],
    stableClasses: classes,
  };
}

function mapNode(
  node: AxeResults["violations"][0]["nodes"][0],
  ruleId: string,
): WebsiteViolationNode {
  const selectorLabel = formatAxeTarget(node.target);
  const landmark = inferLandmarkFromSelector(selectorLabel);
  const elementContext = parseElementContext(node.html);
  const domSignature = buildDomSignature({
    ruleId,
    selectorLabel,
    tag: elementContext.tag,
    role: elementContext.role,
    stableClasses: elementContext.stableClasses,
    landmark,
  });
  const snippet = truncateSnippet(node.html);
  return {
    target: node.target,
    selectorLabel,
    htmlSnippet: snippet,
    failureSummary: node.failureSummary ?? undefined,
    landmarkContext: landmark,
    elementContext,
    domSignature,
    evidenceTruncated: Boolean(
      snippet && node.html && snippet.length < node.html.length,
    ),
  };
}

function mapNodes(
  ruleId: string,
  nodes: AxeResults["violations"][0]["nodes"],
  remainingBudget: { count: number },
): WebsiteViolationNode[] {
  const mapped = nodes.map((n) => mapNode(n, ruleId));
  const diverse = selectRepresentativeNodes(mapped, MAX_AXE_NODES_PER_RULE);
  const out: WebsiteViolationNode[] = [];
  for (const node of diverse) {
    if (remainingBudget.count <= 0) break;
    out.push(node);
    remainingBudget.count -= 1;
  }
  return out;
}

function mapViolation(
  rule: AxeResults["violations"][0],
  remainingBudget: { count: number },
  includeBestPractices: boolean,
): WebsiteAccessibilityViolation | null {
  const isBp = isBestPracticeRule(rule.tags);
  if (isBp && !includeBestPractices) return null;

  return {
    id: rule.id,
    impact: mapImpact(rule.impact),
    help: rule.help,
    description: rule.description,
    helpUrl: rule.helpUrl,
    tags: [...(rule.tags ?? [])],
    wcagCriteria: extractWcagCriteria(rule.tags),
    level: deriveRuleLevel(rule.tags),
    totalNodeCount: rule.nodes.length,
    nodes: mapNodes(rule.id, rule.nodes, remainingBudget),
    isBestPractice: isBp,
  };
}

function mapIncomplete(
  rule: AxeResults["incomplete"][0],
  remainingBudget: { count: number },
): WebsiteAccessibilityIncomplete {
  return {
    id: rule.id,
    impact: mapImpact(rule.impact),
    help: rule.help,
    description: rule.description,
    helpUrl: rule.helpUrl,
    tags: [...(rule.tags ?? [])],
    wcagCriteria: extractWcagCriteria(rule.tags),
    level: deriveRuleLevel(rule.tags),
    totalNodeCount: rule.nodes.length,
    nodes: mapNodes(rule.id, rule.nodes, remainingBudget),
  };
}

function rawEvaluatedRecord(
  rule: {
    id: string;
    impact?: string | null;
    help: string;
    description?: string;
    tags?: string[];
    nodes: unknown[];
  },
  axeBucket: AxeEvaluatedRuleRecord["axeBucket"],
  includeBestPractices: boolean,
): AxeEvaluatedRuleRecord {
  const tags = rule.tags ?? [];
  const isBp = isBestPracticeRule(tags);
  const excluded =
    isBp && !includeBestPractices && axeBucket === "violation";
  return {
    ruleId: rule.id,
    axeBucket,
    nodeCount: rule.nodes.length,
    help: rule.help,
    description: rule.description,
    tags: [...tags],
    impact: mapImpact(rule.impact),
    isBestPractice: isBp,
    excludedFromViolations: excluded || undefined,
  };
}

export function normalizeAxeResults(
  results: AxeResults,
  includeBestPractices: boolean,
): {
  violations: WebsiteAccessibilityViolation[];
  incomplete: WebsiteAccessibilityIncomplete[];
  passesCount: number;
  inapplicableCount: number;
  summary: PageAccessibilitySummary;
  axeVersion: string;
  axeEvaluatedRules: AxeEvaluatedRuleRecord[];
} {
  const remainingBudget = { count: MAX_TOTAL_REPORTED_NODES_PER_PAGE };
  const violations: WebsiteAccessibilityViolation[] = [];

  for (const rule of results.violations) {
    const mapped = mapViolation(rule, remainingBudget, includeBestPractices);
    if (mapped) violations.push(mapped);
  }

  const incomplete: WebsiteAccessibilityIncomplete[] = [];
  for (const rule of results.incomplete) {
    incomplete.push(mapIncomplete(rule, remainingBudget));
  }

  const summary: PageAccessibilitySummary = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
    unknown: 0,
    incomplete: incomplete.length,
    bestPractice: 0,
  };

  for (const v of violations) {
    if (v.isBestPractice) {
      summary.bestPractice += 1;
      continue;
    }
    summary[v.impact === "unknown" ? "unknown" : v.impact] += 1;
  }

  const axeEvaluatedRules: AxeEvaluatedRuleRecord[] = [
    ...results.violations.map((r) =>
      rawEvaluatedRecord(r, "violation", includeBestPractices),
    ),
    ...results.incomplete.map((r) =>
      rawEvaluatedRecord(r, "incomplete", includeBestPractices),
    ),
    ...results.passes.map((r) => rawEvaluatedRecord(r, "pass", includeBestPractices)),
    ...results.inapplicable.map((r) =>
      rawEvaluatedRecord(r, "inapplicable", includeBestPractices),
    ),
  ];

  return {
    violations,
    incomplete,
    passesCount: results.passes.length,
    inapplicableCount: results.inapplicable.length,
    summary,
    axeVersion: results.testEngine?.version ?? "unknown",
    axeEvaluatedRules,
  };
}

export function filterBestPracticeOnly(
  violations: WebsiteAccessibilityViolation[],
): WebsiteAccessibilityViolation[] {
  return violations.filter((v) => !v.tags.includes(AXE_BEST_PRACTICE_TAG));
}
