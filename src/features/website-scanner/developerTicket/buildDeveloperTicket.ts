import {
  getRuleKnowledge,
  getUserImpactForRule,
} from "@/features/accessibility-intelligence/knowledge/ruleKnowledge";
import { acceptanceCriteriaForRule } from "@/features/website-scanner/developerTicket/acceptanceCriteriaForRule";
import {
  DEVELOPER_TICKET_VERSION,
  MAX_TICKET_HTML_EXAMPLES,
  MAX_TICKET_PAGE_EXAMPLES,
  MAX_TICKET_SELECTORS,
  MAX_TICKET_TITLE_CHARS,
} from "@/features/website-scanner/developerTicket/constants";
import { sanitizeTicketHtmlSnippet } from "@/features/website-scanner/developerTicket/sanitizeDeveloperTicketContent";
import type { BuildDeveloperTicketInput, DeveloperTicket } from "@/features/website-scanner/developerTicket/types";
import { verificationStepsForTicket } from "@/features/website-scanner/developerTicket/verificationStepsForTicket";
import { pagePathFromUrl } from "@/features/website-scanner/developerTicket/pagePathFromUrl";

function truncateTitle(title: string): string {
  const t = title.trim();
  if (t.length <= MAX_TICKET_TITLE_CHARS) return t;
  return `${t.slice(0, MAX_TICKET_TITLE_CHARS - 1).trim()}…`;
}

function buildTitle(ruleId: string, knowledgeTitle: string | undefined, rootLabel?: string): string {
  const plain = knowledgeTitle ?? rootLabel ?? ruleId;
  const lower = plain.toLowerCase();
  if (lower.startsWith("accessibility:")) return truncateTitle(plain);
  if (ruleId === "document-title" || ruleId === "html-has-lang") {
    return truncateTitle(`Accessibility: ${plain}`);
  }
  return truncateTitle(`Accessibility: ${plain}`);
}

function rootCauseConfidenceNote(
  confidence: "high" | "medium" | "low",
  likelyShared: boolean,
): string | undefined {
  if (!likelyShared) return undefined;
  if (confidence === "high") {
    return "This appears to be a repeated shared pattern.";
  }
  if (confidence === "medium") {
    return "This may originate from a repeated component or template.";
  }
  return "Grouping suggests a repeated pattern; confirm in your codebase.";
}

function buildSummary(input: BuildDeveloperTicketInput): string {
  const knowledge = getRuleKnowledge(input.ruleId);
  const template = knowledge?.deterministicFixTemplate;
  const rc = input.rootCause;
  if (rc) {
    const pages = rc.affectedPages.length;
    const els = rc.totalOccurrences;
    const what = template?.whatIsWrong ?? input.axeHelp;
    let s = `${what} The pattern was detected across ${pages} scanned page(s) and affects ${els} element(s).`;
    const note = rootCauseConfidenceNote(rc.confidence, rc.likelySharedComponent);
    if (note) s += ` ${note}`;
    if (input.viewportDetail) s += ` ${input.viewportDetail}`;
    return s;
  }
  const fb = input.findingFallback;
  if (fb) {
    const n = fb.occurrenceCount ?? 1;
    return `${fb.description} (${n} occurrence(s) in the current scan.)`;
  }
  return template?.whatIsWrong ?? input.axeHelp;
}

function collectEvidence(input: BuildDeveloperTicketInput): DeveloperTicket["representativeEvidence"] {
  const out: DeveloperTicket["representativeEvidence"] = [];
  const rc = input.rootCause;
  if (rc) {
    const selectors = rc.representativeSelectors.slice(0, MAX_TICKET_SELECTORS);
    const evidenceItems = rc.representativeEvidence.slice(0, MAX_TICKET_HTML_EXAMPLES);
    for (let i = 0; i < Math.max(selectors.length, evidenceItems.length); i++) {
      const ev = evidenceItems[i];
      const sel = ev?.selector ?? selectors[i];
      const pagePath = ev?.pageUrl ? pagePathFromUrl(ev.pageUrl) : "/";
      if (!sel && !ev?.htmlSnippet) continue;
      out.push({
        pagePath,
        selector: sel,
        htmlSnippet: sanitizeTicketHtmlSnippet(ev?.htmlSnippet),
        failureSummary: ev?.failureSummary,
      });
      if (out.length >= MAX_TICKET_HTML_EXAMPLES) break;
    }
    for (const sel of selectors) {
      if (out.length >= MAX_TICKET_SELECTORS) break;
      if (out.some((e) => e.selector === sel)) continue;
      out.push({ pagePath: "/", selector: sel });
    }
    return out.slice(0, MAX_TICKET_SELECTORS);
  }
  const fb = input.findingFallback;
  if (fb) {
    const pagePath = fb.pageUrl ? pagePathFromUrl(fb.pageUrl) : "/";
    for (const e of fb.evidence.slice(0, MAX_TICKET_HTML_EXAMPLES)) {
      out.push({
        pagePath,
        selector: e.selector,
        htmlSnippet: sanitizeTicketHtmlSnippet(e.htmlSnippet),
        failureSummary: e.failureSummary,
      });
    }
  }
  return out;
}

function collectPagePaths(input: BuildDeveloperTicketInput): {
  paths: string[];
  additional: number;
  pageCount: number;
  elementCount: number;
} {
  const rc = input.rootCause;
  if (rc) {
    const unique = [...new Set(rc.affectedPages.map((u) => pagePathFromUrl(u)))];
    const shown = unique.slice(0, MAX_TICKET_PAGE_EXAMPLES);
    return {
      paths: shown,
      additional: Math.max(0, unique.length - shown.length),
      pageCount: unique.length,
      elementCount: rc.totalOccurrences,
    };
  }
  const fb = input.findingFallback;
  const pagePath = fb?.pageUrl ? pagePathFromUrl(fb.pageUrl) : "/";
  return {
    paths: [pagePath],
    additional: 0,
    pageCount: 1,
    elementCount: fb?.occurrenceCount ?? 1,
  };
}

export function buildDeveloperTicket(input: BuildDeveloperTicketInput): DeveloperTicket {
  const knowledge = getRuleKnowledge(input.ruleId);
  const template = knowledge?.deterministicFixTemplate;
  const rc = input.rootCause;
  const pages = collectPagePaths(input);
  const evidence = collectEvidence(input);
  const selectorCount = rc?.representativeSelectors.length ?? evidence.filter((e) => e.selector).length;
  const totalSelectors = rc?.totalOccurrences ?? selectorCount;

  let standardClassification: DeveloperTicket["standardClassification"] = "wcag";
  if (input.bestPractice) standardClassification = "best_practice";
  if (input.humanReviewRequired) standardClassification = "human_review";

  const limitations: string[] = [
    "Automated testing does not replace human accessibility evaluation.",
  ];
  if (input.scanContext.scanCompletenessNote) {
    limitations.unshift(input.scanContext.scanCompletenessNote);
  }
  if (rc && rc.totalOccurrences > evidence.length) {
    const retained = rc.retainedEvidenceCount ?? evidence.length;
    const selectorShown = Math.min(MAX_TICKET_SELECTORS, evidence.length);
    if (retained < rc.totalOccurrences) {
      limitations.push(
        `${rc.totalOccurrences} total affected occurrence(s); detailed evidence retained for ${retained}; ${selectorShown} representative selector(s) shown.`,
      );
    } else {
      limitations.push(
        `${rc.totalOccurrences} total affected elements; ${selectorShown} representative selector(s) shown.`,
      );
    }
  }

  const recommendedFix: string[] = [];
  if (template) {
    recommendedFix.push(template.whatIsWrong);
    recommendedFix.push(template.whyItMatters);
    const lines = template.genericPattern.split("\n").filter(Boolean);
    recommendedFix.push("Recommended approach:");
    recommendedFix.push(...lines.map((l) => `- ${l.trim()}`));
    if (template.whatNotToDo) {
      recommendedFix.push(`Avoid: ${template.whatNotToDo}`);
    }
  } else {
    recommendedFix.push(
      "Review the implementation in context before selecting a remediation approach.",
    );
    recommendedFix.push(input.axeHelp);
  }

  const title = buildTitle(
    input.ruleId,
    knowledge?.plainTitle,
    rc?.label ?? input.findingFallback?.title,
  );

  const ticket: DeveloperTicket = {
    version: DEVELOPER_TICKET_VERSION,
    title,
    summary: buildSummary(input),
    priority: input.priority,
    impact: input.impact,
    sourceType: input.sourceType,
    ruleId: input.ruleId,
    wcagCriteria: input.wcagCriteria ?? [],
    wcagLevel: input.wcagLevel ?? null,
    standardClassification,
    userImpact: getUserImpactForRule(input.ruleId, input.axeHelp),
    rootCause: rc
      ? {
          label: rc.label,
          confidence: rc.confidence,
          likelySharedComponent: rc.likelySharedComponent,
          confidenceNote: rootCauseConfidenceNote(rc.confidence, rc.likelySharedComponent),
        }
      : undefined,
    scope: {
      affectedPageCount: pages.pageCount,
      affectedElementCount: pages.elementCount,
      affectedPagePaths: pages.paths,
      additionalPageCount: pages.additional,
      selectorsShown: evidence.filter((e) => e.selector).length,
      totalSelectorsAvailable: totalSelectors,
      retainedEvidenceCount: rc?.retainedEvidenceCount,
    },
    representativeEvidence: evidence,
    recommendedFix,
    possibleImplementationPattern: knowledge?.afterExample
      ? knowledge.afterExample
      : undefined,
    acceptanceCriteria: acceptanceCriteriaForRule(
      input.ruleId,
      template,
      input.humanReviewRequired,
    ),
    verificationSteps: verificationStepsForTicket({
      ruleId: input.ruleId,
      template,
      humanReviewRequired: input.humanReviewRequired,
      likelySharedComponent: rc?.likelySharedComponent,
      hasAutomatedRule: !input.humanReviewRequired && standardClassification !== "human_review",
    }),
    manualReviewRequired: Boolean(input.humanReviewRequired),
    limitations,
    scanContext: input.scanContext,
  };

  if (input.aiGuidance) {
    ticket.aiAssistedGuidance = {
      ...input.aiGuidance,
      disclaimer:
        "AI-Assisted Guidance — Review Before Implementation. Supplemental only; verify in your codebase before shipping.",
    };
  }

  return ticket;
}
