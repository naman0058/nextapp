import { REPORT_DISCLAIMER } from "@/features/reports/constants/disclaimer";
import { REPORT_METHODOLOGY } from "@/features/reports/constants/methodology";
import { REPORT_VERSION } from "@/features/reports/constants/reportVersion";
import { BASE_REPORT_LIMITATIONS } from "@/features/reports/constants/limitations";
import type {
  AccessibilityPreflightReport,
  ReportFinding,
  ReportSection,
} from "@/features/reports/types/reportModel";
import { getRuleKnowledge } from "@/features/accessibility-intelligence/knowledge/ruleKnowledge";
import { WEBSITE_MANUAL_REVIEW_ITEMS } from "@/features/website-scanner/constants/manualReviewChecklist";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import {
  aggregateScanCompleteness,
  scanCompletenessLabel,
} from "@/features/website-scanner/utils/scanCompletenessAggregate";
import { attachAiRemediationAppendix } from "@/features/reports/utils/attachAiRemediationAppendix";
import { collectWebsiteRemediationCandidates } from "@/lib/ai/remediation/report";
import { websiteAiRemediationSelectionFromSession } from "@/features/website-scanner/utils/websiteReportAiSelection";

function buildFindings(
  pages: WebsitePageScanResult[],
  session: WebsiteScanSessionState,
): ReportFinding[] {
  const findings: ReportFinding[] = [];
  const intel = session.siteIntelligence;
  for (const page of pages) {
    for (const v of page.violations) {
      const normalized = intel?.normalizedFindings.find(
        (f) =>
          f.pageUrl === page.finalUrl &&
          f.ruleId === v.id &&
          f.status === "issue" &&
          (f.viewportId === page.viewport.id || !f.viewportId),
      );
      const examples = v.nodes.length;
      const truncated =
        v.totalNodeCount > examples
          ? ` (${v.totalNodeCount} affected elements; ${examples} example(s) shown)`
          : ` (${v.totalNodeCount} element(s))`;
      findings.push({
        id: `${page.finalUrl}-${v.id}`,
        section: v.isBestPractice ? "Best practices" : "Automated WCAG",
        title: v.help,
        status: "attention",
        priority: normalized?.priority ?? "medium",
        sourceType: "automated_rule",
        finding: `${v.description}${truncated} on ${page.finalUrl}`,
        recommendation: normalized?.recommendation ?? v.helpUrl,
        technicalId: v.id,
      });
    }
    for (const inc of page.incomplete) {
      findings.push({
        id: `${page.finalUrl}-${inc.id}-incomplete`,
        section: "Human review",
        title: inc.help,
        status: "review",
        sourceType: "manual_review",
        finding: inc.description,
        technicalId: inc.id,
      });
    }
  }
  for (const item of WEBSITE_MANUAL_REVIEW_ITEMS) {
    const entry = session.manualReview.find((m) => m.itemId === item.id);
    findings.push({
      id: `manual-${item.id}`,
      section: "Checklist",
      title: item.title,
      status:
        entry?.status === "passes"
          ? "ready"
          : entry?.status === "not_applicable"
            ? "not_applicable"
            : "review",
      sourceType: "manual_review",
      finding: item.detail,
    });
  }
  for (const [ruleId, guidance] of Object.entries(session.aiGuidance)) {
    if (guidance.stale) continue;
    findings.push({
      id: `ai-${ruleId}`,
      section: "AI guidance",
      title: ruleId,
      status: "review",
      sourceType: "ai_guidance",
      finding: guidance.plainLanguageExplanation,
      recommendation: guidance.suggestedFixes.join("; "),
    });
  }
  if (session.includeDeveloperFixGuidanceInReport) {
    const seen = new Set<string>();
    for (const page of pages) {
      for (const v of page.violations) {
        if (seen.has(v.id)) continue;
        seen.add(v.id);
        const knowledge = getRuleKnowledge(v.id);
        const tpl = knowledge?.deterministicFixTemplate;
        if (!tpl) continue;
        findings.push({
          id: `dev-fix-${v.id}`,
          section: "Developer fix appendix",
          title: knowledge.plainTitle ?? v.help,
          status: "review",
          sourceType: "automated_rule",
          finding: tpl.whatIsWrong,
          recommendation: `${tpl.genericPattern} — Verify: ${tpl.howToVerify}`,
          technicalId: v.id,
        });
      }
    }
  }
  return findings;
}

function buildExecutiveSummary(session: WebsiteScanSessionState): string[] {
  const intel = session.siteIntelligence;
  const lines: string[] = [];
  const scope = session.scanScope;
  if (scope.urlsSelected > 0) {
    lines.push(
      `Scan scope: ${scope.pagesCompleted} of ${scope.urlsSelected} selected pages scanned (${session.viewportMode} mode).`,
    );
    if (scope.pagesCompleted < scope.urlsSelected) {
      lines.push("Partial scan — not all selected pages completed.");
    }
  }
  if (intel) {
    lines.push(
      `Top priorities: ${intel.fixPlan
        .slice(0, 5)
        .map((f) => f.title)
        .join("; ") || "None"}`,
    );
    lines.push(
      `Likely root causes: ${intel.summary.likelyRootCauses}; unique automated rules: ${intel.summary.uniqueAutomatedRules}.`,
    );
    const auto = intel.wcagCoverage.filter((c) => c.automation === "automated").length;
    const manual = intel.wcagCoverage.filter((c) => c.automation === "manual").length;
    lines.push(
      `WCAG matrix: ${auto} automated-tracked criteria, ${manual} manual-review criteria (not a compliance score).`,
    );
  }
  const remainingManual = session.manualReview.filter(
    (m) => m.status === "not_reviewed" || m.status === "needs_review",
  ).length;
  lines.push(`Human review checklist items still open: ${remainingManual}.`);
  return lines;
}

export type BuildWebsiteScanReportOptions = {
  forExport?: boolean;
  sampleLabel?: string;
  forceIncludeAiRemediation?: boolean;
};

export function buildWebsiteScanReport(
  pages: WebsitePageScanResult[],
  session: WebsiteScanSessionState,
  options?: BuildWebsiteScanReportOptions,
): AccessibilityPreflightReport {
  const findings = buildFindings(pages, session);
  const completeness = aggregateScanCompleteness(pages);
  const executive = buildExecutiveSummary(session);
  const automatedSection: ReportSection = {
    id: "website-automated",
    title: "Automated website findings",
    sectionStatus: "Review Required",
    findings,
  };

  const attention = findings.filter((f) => f.status === "attention").length;
  const review = findings.filter((f) => f.status === "review").length;

  const base: AccessibilityPreflightReport = {
    reportId: `rpt-web-${session.sessionId.slice(0, 8)}`,
    generatedAt: new Date().toISOString(),
    generatedAtDisplay: new Date().toLocaleString(),
    reportVersion: REPORT_VERSION,
    contentType: "website_scan",
    platform: null,
    projectInfo: {
      reportTitle:
        session.reportBranding.reportSubtitle?.trim() ||
        "Website accessibility scan",
      contentIdentifier: session.rootUrl,
      clientOrganization: session.reportBranding.clientOrganization || undefined,
      campaignProjectName: session.reportBranding.projectName || undefined,
      preparedBy: session.reportBranding.preparedBy || undefined,
      internalNotes: session.reportBranding.preparedFor
        ? `Prepared for: ${session.reportBranding.preparedFor}`
        : undefined,
    },
    summary: {
      overallStatus:
        attention > 0 ? "Important Issues Identified" : "Review Recommended",
      platform: null,
      contentType: "website_scan",
      checksCompleted: findings.length,
      itemsReady: findings.filter((f) => f.status === "ready").length,
      itemsRequiringReview: review,
      importantIssues: attention,
      humanReviewRemaining: review,
      sectionSummaries: [
        {
          id: automatedSection.id,
          label: automatedSection.title,
          tone: "attention",
        },
      ],
    },
    textAccessibility: automatedSection,
    humanReview: {
      items: WEBSITE_MANUAL_REVIEW_ITEMS.map((item) => ({
        id: item.id,
        title: item.title,
        detail: item.detail,
        priority: "medium",
        status: "pending",
        phase: "website",
      })),
      remainingCount: review,
    },
    methodology: {
      ...REPORT_METHODOLOGY,
      categories: [
        ...REPORT_METHODOLOGY.categories,
        {
          type: "automated_rule",
          label: "Website automated rules",
          examples: ["axe-core via Playwright Chromium"],
        },
      ],
    },
    limitations: [
      ...BASE_REPORT_LIMITATIONS,
      "Website scan evaluates loaded page state only; interactive states may need separate manual testing.",
      "Site crawl is limited to configured same-origin page count, not the entire website.",
      "Scanner does not access login-protected or private pages.",
      `Scan completeness: ${scanCompletenessLabel(completeness)}.`,
      ...executive,
      session.siteIntelligence?.priorityExplanation ??
        "Remediation priority considers impact and repetition; it is not a legal-risk rating.",
      ...(session.siteIntelligence?.rootCauseGroups
        .filter((g) => g.likelySharedComponent)
        .slice(0, 5)
        .map(
          (g) =>
            `Likely shared root cause: ${g.label} (${g.totalOccurrences} occurrences, ${g.affectedPages.length} pages).`,
        ) ?? []),
    ],
    disclaimer: `${REPORT_DISCLAIMER} Automated accessibility scans cannot evaluate every accessibility requirement. This report is not legal advice or accessibility certification and requires human review.`,
  };

  const selection = websiteAiRemediationSelectionFromSession(session, {
    forExport: options?.forExport,
    sampleLabel: options?.sampleLabel,
  });
  if (options?.forceIncludeAiRemediation) {
    const candidates = collectWebsiteRemediationCandidates(
      session,
      session.siteIntelligence,
    );
    selection.includeAppendix = true;
    selection.selectedIds = candidates.filter((c) => !c.stale).map((c) => c.id);
  }
  const candidates = collectWebsiteRemediationCandidates(
    session,
    session.siteIntelligence,
  );
  return attachAiRemediationAppendix(base, candidates, selection);
}
