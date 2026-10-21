import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";
import {
  ENTERPRISE_PDF_MAIN_EVIDENCE_LIMIT,
  ENTERPRISE_REPORT_SCHEMA_VERSION,
  EXECUTIVE_SHORT_NOTE,
  ZERO_FINDING_NOTE,
} from "@/features/reports/enterprise/constants";
import { buildExportSelectionPolicy } from "@/features/reports/enterprise/exportInclusionPolicy";
import { buildEnterpriseRemediationPlan } from "@/features/reports/enterprise/buildEnterpriseRemediationPlan";
import { buildWebsiteReportMethodology } from "@/features/reports/enterprise/buildWebsiteReportMethodology";
import type {
  EnterpriseAutomatedFinding,
  EnterpriseEvidenceRow,
  EnterprisePreflightReport,
  EnterpriseVerificationRow,
} from "@/features/reports/enterprise/types";
import { getUserImpactForRule } from "@/features/accessibility-intelligence/knowledge/ruleKnowledge";
import { HUMAN_REVIEW_REGISTRY_V1 } from "@/features/human-review-workspace/registry/v1";
import { REMEDIATION_LIBRARY_VERSION } from "@/features/website-scanner/remediation/types";
import { getDeterministicRemediation } from "@/features/website-scanner/remediation/registry";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import { compareScanSnapshots } from "@/features/website-scanner/utils/compareScanSnapshots";
import {
  buildPageScanDiagnostic,
  formatPageExecutionLabel,
} from "@/features/website-scanner/utils/pageScanDiagnostics";
import { sanitizeTicketHtmlSnippet } from "@/features/website-scanner/developerTicket/sanitizeDeveloperTicketContent";

const REGISTRY_VERSION = HUMAN_REVIEW_REGISTRY_V1[0]?.version ?? 1;

function sourceBadgeForKind(kind: EnterpriseAutomatedFinding["kind"]): string {
  if (kind === "best_practice") return "Best practice";
  if (kind === "incomplete_only") return "Needs manual confirmation";
  return "Automated — axe";
}

function mapEvidence(
  detail: import("@/features/website-scanner/findingDetail/types").FindingDetail,
  limit: number,
): EnterpriseEvidenceRow[] {
  return detail.evidenceItems.slice(0, limit).map((e) => ({
    evidenceId: e.evidenceId,
    pageUrl: e.pageUrl,
    viewportId: e.viewportId,
    selector: e.selector ?? null,
    failureSummary: e.failureSummary ?? null,
    sanitizedHtml: e.htmlSnippet
      ? (sanitizeTicketHtmlSnippet(e.htmlSnippet) ?? "").slice(0, 800)
      : null,
  }));
}

function buildAutomatedFinding(
  detail: import("@/features/website-scanner/findingDetail/types").FindingDetail,
): EnterpriseAutomatedFinding {
  const reg = getDeterministicRemediation(detail.ruleId);
  const pdfShown = Math.min(
    ENTERPRISE_PDF_MAIN_EVIDENCE_LIMIT,
    detail.evidenceItems.length,
  );
  return {
    findingId: detail.findingId,
    ruleId: detail.ruleId,
    title: detail.title,
    category: detail.category,
    impact: detail.impact,
    priority: detail.priority,
    sourceBadge: sourceBadgeForKind(detail.kind),
    kind: detail.kind,
    wcagMappings: detail.wcagMappings,
    totalOccurrences: detail.totalOccurrences,
    retainedEvidenceCount: detail.retainedEvidenceCount,
    pdfMainEvidenceLimit: ENTERPRISE_PDF_MAIN_EVIDENCE_LIMIT,
    pdfShownCount: pdfShown,
    pagesAffected: detail.pagesAffected,
    affectedUrls: detail.affectedUrls,
    affectedViewports: detail.affectedViewports,
    pageViewportBreakdown: detail.pageViewportScopes,
    problem: detail.description,
    whyItMatters: getUserImpactForRule(detail.ruleId, detail.title),
    representativeEvidence: mapEvidence(detail, ENTERPRISE_PDF_MAIN_EVIDENCE_LIMIT),
    remediationDefinitionId: reg?.ruleId ?? null,
    remediationDefinitionVersion: reg?.definitionVersion ?? null,
    recommendedAction: reg?.shortProblem ?? null,
    verificationSteps: reg?.verificationSteps.map((s) => s.text) ?? [],
  };
}

function verificationLabel(status: string): string {
  switch (status) {
    case "resolved":
      return "No longer detected in automated rescan";
    case "persistent":
      return "Still detected";
    case "new":
      return "New in automated rescan";
    case "changed":
      return "Changed / evidence differs";
    default:
      return "Could not verify";
  }
}

export function buildEnterprisePreflightReport(
  pages: WebsitePageScanResult[],
  session: WebsiteScanSessionState,
  report: AccessibilityPreflightReport,
): EnterprisePreflightReport | null {
  if (report.contentType !== "website_scan") return null;
  const executive = report.websiteExecutivePreflight;
  const taxonomy = report.websiteScanTaxonomy;
  if (!executive || !taxonomy) return null;

  const intel = session.siteIntelligence;
  const findingDetails = intel?.findingDetails ?? [];
  const failureRuleIds = new Set(
    findingDetails
      .filter((d) => d.kind === "automated_failure")
      .map((d) => d.ruleId),
  );

  const automatedFindings = findingDetails
    .filter((d) => d.kind === "automated_failure")
    .map(buildAutomatedFinding);

  const incompleteFindings = findingDetails
    .filter((d) => d.kind === "incomplete_only")
    .map((d) => ({
      ruleId: d.ruleId,
      title: d.title,
      description: d.description,
      relatedHumanReviewCheckIds: d.relatedHumanReviewCheckIds,
      overlapsFailure: failureRuleIds.has(d.ruleId),
    }));

  const bestPracticeFindings = findingDetails
    .filter((d) => d.kind === "best_practice")
    .map((d) => ({
      ruleId: d.ruleId,
      title: d.title,
      totalOccurrences: d.totalOccurrences,
      pagesAffected: d.pagesAffected,
    }));

  const firstPage = pages[0];
  const scope = session.scanScope;
  const partial =
    scope.urlsSelected > 0 && scope.pagesCompleted < scope.urlsSelected
      ? `${scope.pagesCompleted} of ${scope.urlsSelected} selected pages scanned successfully. Unscanned pages are not reported as pass.`
      : null;

  const humanReview = report.humanReviewWorkspace ?? {
    progress: {
      relevant: 0,
      reviewed: 0,
      passes: 0,
      needsReview: 0,
      notApplicable: 0,
      notReviewed: 0,
      unknownApplicability: 0,
      possiblyRelevant: 0,
      remainingOpen: 0,
    },
    records: [],
    disclaimer: "",
  };

  const verification: EnterpriseVerificationRow[] = [];
  if (session.previousSnapshot?.length) {
    const comparison = compareScanSnapshots(session.previousSnapshot, pages);
    for (const row of comparison.rows.slice(0, 100)) {
      verification.push({
        ruleId: row.ruleId,
        pageUrl: row.pageUrl,
        selector: row.selector,
        statusLabel: verificationLabel(row.status),
        detail:
          row.previousOccurrenceCount != null && row.currentOccurrenceCount != null
            ? `Before: ${row.previousOccurrenceCount} · After: ${row.currentOccurrenceCount}`
            : row.status,
      });
    }
  }

  const pageInventory = executive.pageHotspots.map((h) => ({
    url: h.pageUrl,
    title: "",
    viewportLabel: String(session.viewportMode),
    executionLabel: h.completenessLabel,
    failedRules: h.failedRules,
    occurrences: h.affectedOccurrences,
    needsConfirmation: h.needsConfirmation,
  }));

  for (const p of pages) {
    if (pageInventory.some((r) => r.url === p.finalUrl)) continue;
    const diag = buildPageScanDiagnostic(p);
    pageInventory.push({
      url: p.finalUrl,
      title: p.pageTitle ?? "",
      viewportLabel: p.viewport.label,
      executionLabel: formatPageExecutionLabel(diag.pageExecution),
      failedRules: p.violations.filter((v) => !v.isBestPractice).length,
      occurrences: p.violations
        .filter((v) => !v.isBestPractice)
        .reduce((n, v) => n + v.totalNodeCount, 0),
      needsConfirmation: p.incomplete.length,
    });
  }

  const additionalEvidence = report.reportWorkspace?.contributions ?? [];
  const remediationPlan = buildEnterpriseRemediationPlan({
    intel: session.siteIntelligence,
    preferredFramework: null,
  });

  const zeroFindingNote =
    executive.snapshot.failedAutomatedRules === 0 ? ZERO_FINDING_NOTE : null;

  return {
    reportMeta: {
      reportId: report.reportId,
      reportSchemaVersion: ENTERPRISE_REPORT_SCHEMA_VERSION,
      generatedAt: report.generatedAt,
      generatedAtDisplay: report.generatedAtDisplay,
      reportVersion: report.reportVersion,
      remediationLibraryVersion: REMEDIATION_LIBRARY_VERSION,
      humanReviewRegistryVersion: REGISTRY_VERSION,
      axeVersion: firstPage?.axeVersion ?? null,
      scannerVersion: firstPage?.scannerVersion ?? null,
    },
    scope: {
      targetUrl: session.rootUrl,
      scanMode: session.mode,
      viewportMode: session.viewportMode,
      pagesSelected: scope.urlsSelected,
      pagesScanned: scope.pagesCompleted,
      scanSource: session.scanSource,
      executionStatusLabel: executive.snapshot.coverageStatusLabel,
      partialScanNote: partial,
    },
    executiveSummary: {
      statusPhrase: executive.snapshot.preflightStatusPhrase,
      shortNote: EXECUTIVE_SHORT_NOTE,
      zeroFindingNote,
      snapshot: executive.snapshot,
    },
    coverage: executive.coverageDiagnostic,
    affectedAreas: executive.categorySummary.filter(
      (c) =>
        c.failedRuleCount > 0 ||
        c.affectedOccurrences > 0 ||
        c.confirmationNeededCount > 0,
    ),
    priorities: executive.topRemediationPriorities.slice(0, 5),
    taxonomy,
    automatedFindings,
    remediationPlan,
    incompleteFindings,
    bestPracticeFindings,
    humanReview,
    additionalEvidence,
    pageInventory,
    verification,
    methodology: buildWebsiteReportMethodology(session),
    disclaimer: report.disclaimer,
    exportSelection: buildExportSelectionPolicy(session),
    counters: {
      failedAutomatedRules: taxonomy.failedAutomatedRules,
      affectedOccurrences: taxonomy.affectedOccurrences,
      needsManualConfirmation: taxonomy.needsManualConfirmation,
      humanReviewReviewed: humanReview.progress.reviewed,
      humanReviewRelevant: humanReview.progress.relevant,
      humanReviewRemainingOpen: humanReview.progress.remainingOpen,
      pagesScanned: executive.snapshot.pagesScanned,
      passedAutomatedRules: taxonomy.passedAutomatedRules,
    },
  };
}
