import { REPORT_DISCLAIMER } from "@/features/reports/constants/disclaimer";
import { REPORT_VERSION } from "@/features/reports/constants/reportVersion";
import { BASE_REPORT_LIMITATIONS } from "@/features/reports/constants/limitations";
import type {
  AccessibilityPreflightReport,
  ReportFinding,
  ReportSection,
} from "@/features/reports/types/reportModel";
import type { OverallReportStatus } from "@/features/reports/types/reportStatus";
import {
  getDeterministicRemediation,
  hasFullDeterministicRemediation,
} from "@/features/website-scanner/remediation/registry";
import { buildEnterprisePreflightReport } from "@/features/reports/enterprise/buildEnterprisePreflightReport";
import { buildWebsiteReportMethodology } from "@/features/reports/enterprise/buildWebsiteReportMethodology";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import {
  aggregateEvidenceReporting,
  aggregatePageExecution,
  buildSiteScanDiagnostics,
  formatEvidenceReportingLabel,
  formatPageExecutionLabel,
} from "@/features/website-scanner/utils/pageScanDiagnostics";
import { attachAiRemediationAppendix } from "@/features/reports/utils/attachAiRemediationAppendix";
import { buildReportWorkspaceBlock } from "@/features/accessibility-workspace/buildContrastContribution";
import { buildHumanReviewReportBlock } from "@/features/human-review-workspace/buildHumanReviewReportBlock";
import { ensureHumanReviewRecords } from "@/features/human-review-workspace/ensureHumanReviewRecords";
import { collectWebsiteRemediationCandidates } from "@/lib/ai/remediation/report";
import { websiteAiRemediationSelectionFromSession } from "@/features/website-scanner/utils/websiteReportAiSelection";
import { scanResultCounters } from "@/features/website-scanner/taxonomy/buildScanResultModel";

function appendTaxonomyReportFindings(
  findings: ReportFinding[],
  session: WebsiteScanSessionState,
): void {
  const model = session.siteIntelligence?.scanResultModel;
  if (!model) return;

  const seenPass = new Set<string>();
  for (const e of model.passedChecks) {
    if (seenPass.has(e.ruleId)) continue;
    seenPass.add(e.ruleId);
    findings.push({
      id: `axe-pass-${e.ruleId}`,
      section: "Automated checks passed",
      title: e.title,
      status: "ready",
      sourceType: "automated_rule",
      finding: `Automated check passed (${e.productCategory}).${
        e.wcagCriteria.length
          ? ` Mapped WCAG: ${e.wcagCriteria.join(", ")} (${e.wcagLevel}).`
          : ""
      } Passing this automated rule does not establish compliance with the full success criterion.`,
      technicalId: e.ruleId,
    });
  }

  const seenNa = new Set<string>();
  for (const e of model.notApplicableChecks) {
    if (seenNa.has(e.ruleId)) continue;
    seenNa.add(e.ruleId);
    findings.push({
      id: `axe-na-${e.ruleId}`,
      section: "Not applicable",
      title: e.title,
      status: "not_applicable",
      sourceType: "automated_rule",
      finding: "Not applicable to scanned page state.",
      technicalId: e.ruleId,
    });
  }
}

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
      const remediationDef = getDeterministicRemediation(v.id);
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
        remediationDefinitionId: remediationDef?.ruleId,
        remediationDefinitionVersion: remediationDef?.definitionVersion,
      });
    }
    const automatedRuleIds = new Set(
      page.violations.filter((v) => !v.isBestPractice).map((v) => v.id),
    );
    for (const inc of page.incomplete) {
      const overlapsAutomated = automatedRuleIds.has(inc.id);
      findings.push({
        id: `${page.finalUrl}-${inc.id}-incomplete`,
        section: overlapsAutomated ? "Needs manual confirmation" : "Human review",
        title: overlapsAutomated
          ? `Needs manual confirmation: ${inc.help}`
          : inc.help,
        status: "review",
        sourceType: "manual_review",
        finding: overlapsAutomated
          ? `Axe could not fully automate this check; manual verification required. ${inc.description}`
          : inc.description,
        technicalId: inc.id,
      });
    }
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
        const remediation = getDeterministicRemediation(v.id);
        if (!remediation || !hasFullDeterministicRemediation(v.id)) continue;
        findings.push({
          id: `dev-fix-${v.id}`,
          section: "Developer fix appendix",
          title: remediation.title,
          status: "review",
          sourceType: "automated_rule",
          finding: remediation.shortProblem,
          recommendation: `${remediation.remediationSteps.slice(0, 3).join(" ")} — Verify: ${remediation.verificationSteps.map((x) => x.text).join("; ")}`,
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
      `Shared root causes: ${intel.summary.sharedRootCauses ?? intel.summary.likelyRootCauses}; unique automated rules: ${intel.summary.uniqueAutomatedRules}.`,
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
  const pageExecution = aggregatePageExecution(pages);
  const evidenceReporting = aggregateEvidenceReporting(pages);
  const diagnostics = buildSiteScanDiagnostics(pages);
  const executive = buildExecutiveSummary(session);
  const automatedSection: ReportSection = {
    id: "website-automated",
    title: "Automated website findings",
    sectionStatus: "Review Required",
    findings,
  };

  const attention = findings.filter((f) => f.status === "attention").length;
  const review = findings.filter((f) => f.status === "review").length;
  const taxonomy = scanResultCounters(session.siteIntelligence?.scanResultModel);
  appendTaxonomyReportFindings(findings, session);

  const contributions = session.accessibilityWorkspace?.contributions ?? [];
  const humanReviewRecords = ensureHumanReviewRecords({
    records: session.accessibilityWorkspace?.humanReviewRecords ?? [],
    manualReview: session.manualReview,
    completedPages: pages,
    intel: session.siteIntelligence,
    contributions,
    urlsSelected: session.scanScope.urlsSelected,
  });
  const humanReviewWorkspace = buildHumanReviewReportBlock(humanReviewRecords);
  const reportWorkspace = buildReportWorkspaceBlock(
    contributions,
    humanReviewWorkspace.progress.reviewed,
    humanReviewWorkspace.progress.relevant,
  );

  const executivePreflight = session.siteIntelligence?.executivePreflight;
  const statusPhrase =
    executivePreflight?.snapshot.preflightStatusPhrase ??
    (attention > 0 ? "Important automated findings identified" : "Review Recommended");
  const websiteMethodology = buildWebsiteReportMethodology(session);

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
      overallStatus: statusPhrase as OverallReportStatus,
      platform: null,
      contentType: "website_scan",
      checksCompleted: findings.length,
      itemsReady: findings.filter((f) => f.status === "ready").length,
      itemsRequiringReview: review,
      importantIssues: attention,
      humanReviewRemaining: humanReviewWorkspace.progress.remainingOpen,
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
      items: humanReviewWorkspace.records.map((r) => ({
        id: r.reviewId,
        title: r.title,
        detail:
          r.status === "passes"
            ? "Reviewer marked this procedure as passes (human review result)."
            : r.status === "needs_review"
              ? "Needs further review."
              : r.status === "not_applicable"
                ? "Not applicable to the reviewed scope."
                : "Not reviewed.",
        priority: "medium",
        status:
          r.status === "passes" || r.status === "not_applicable"
            ? "completed"
            : "pending",
        phase: "website",
      })),
      remainingCount: humanReviewWorkspace.progress.remainingOpen,
    },
    humanReviewWorkspace,
    methodology: {
      version: websiteMethodology.version,
      categories: websiteMethodology.sections.map((s) => ({
        type: "automated_rule" as const,
        label: s.title,
        examples: s.bullets,
      })),
    },
    limitations: [
      ...BASE_REPORT_LIMITATIONS,
      "Website scan evaluates loaded page state only; interactive states may need separate manual testing.",
      "Site crawl is limited to configured same-origin page count, not the entire website.",
      "Scanner does not access login-protected or private pages.",
      `Page execution: ${formatPageExecutionLabel(pageExecution)}.`,
      `Evidence reporting: ${formatEvidenceReportingLabel(evidenceReporting)}.`,
      ...diagnostics.flatMap((d) => [
        ...d.executionReasons,
        ...d.evidenceReasons,
      ]),
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
      `Automated analysis (axe rules): ${taxonomy.failedAutomatedRules} failed, ${taxonomy.affectedOccurrences} affected occurrence(s), ${taxonomy.passedAutomatedRules} passed rule(s), ${taxonomy.needsManualConfirmation} need manual confirmation, ${taxonomy.notApplicableRules} not applicable, ${taxonomy.bestPracticeObservations} best-practice observation(s).`,
      "Passing an automated rule does not establish WCAG compliance; human review remains required.",
    ],
    disclaimer: `${REPORT_DISCLAIMER} Automated accessibility scans cannot evaluate every accessibility requirement. This report is not legal advice or accessibility certification and requires human review.`,
    websiteScanTaxonomy: taxonomy,
    websiteExecutivePreflight: session.siteIntelligence?.executivePreflight,
    reportWorkspace:
      reportWorkspace.contributions.length > 0 ? reportWorkspace : undefined,
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
  const withAi = attachAiRemediationAppendix(base, candidates, selection);
  const enterpriseView = buildEnterprisePreflightReport(pages, session, withAi);
  return enterpriseView ? { ...withAi, enterpriseView } : withAi;
}
