import type { DeveloperTicket } from "@/features/website-scanner/developerTicket/types";
import type { ReportContribution } from "@/features/accessibility-workspace/types";
import { developerTicketContributionId } from "@/features/accessibility-workspace/contributionIds";
import { getDeterministicRemediation } from "@/features/website-scanner/remediation/registry";
import { sanitizeHandoffPageOrigin } from "@/features/accessibility-workspace/sanitizeHandoffContext";

export function buildDeveloperTicketContribution(input: {
  ticket: DeveloperTicket;
  findingId: string;
  remediationGroupId?: string;
  ruleId: string;
  includedInReport: boolean;
  pageUrl?: string;
  framework?: string;
}): ReportContribution {
  const now = new Date().toISOString();
  const def = getDeterministicRemediation(input.ruleId);
  const findingCount = 1;
  const acceptanceCount = input.ticket.acceptanceCriteria.length;
  const evidenceCount = input.ticket.representativeEvidence.length;

  return {
    contributionId: developerTicketContributionId(input.findingId),
    toolId: "developer_ticket",
    toolVersion: input.ticket.version,
    createdAt: now,
    updatedAt: now,
    sourceType: "developer_handoff",
    scope: {
      type: input.remediationGroupId ? "remediation_group" : "finding",
      pageUrl: sanitizeHandoffPageOrigin(input.pageUrl),
      occurrenceLabel: `Developer handoff for one finding — not implementation confirmation.`,
    },
    title: "Developer handoff generated",
    summary: `Developer handoff generated · ${findingCount} finding · ${acceptanceCount} acceptance criteria · ${evidenceCount} evidence example(s).`,
    findings: [
      {
        id: "dev-handoff",
        title: input.ticket.title,
        summary: "Structured ticket metadata only; full ticket text is not duplicated here.",
        provenance: "developer_handoff",
      },
    ],
    measurements: [
      { name: "acceptance_criteria_count", value: acceptanceCount },
      { name: "representative_evidence_count", value: evidenceCount },
      ...(input.framework
        ? [{ name: "framework", value: input.framework }]
        : []),
    ],
    evidence: [],
    remediationActions: [],
    humanReviewTasks: [],
    verificationResults: [
      {
        kind: "human_review",
        label: "Developer handoff artifact generated",
        detail: "Does not indicate the fix was implemented.",
      },
    ],
    relatedWebsiteFindingIds: [input.findingId],
    relatedRuleIds: [input.ruleId],
    relatedRemediationGroupIds: input.remediationGroupId
      ? [input.remediationGroupId]
      : [],
    includedInReport: input.includedInReport,
    exportEligibility: "allowed",
    privacyClassification: "sanitized_export",
    remediationDefinitionId: def?.ruleId ?? input.ruleId,
    remediationDefinitionVersion: def?.definitionVersion,
  };
}
