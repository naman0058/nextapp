import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { ReportContribution } from "@/features/accessibility-workspace/types";
import type { ManualReviewEntry } from "@/features/website-scanner/types/websiteSession";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { mergePageMetadata } from "@/features/website-scanner/utils/issuesListUtils";
import { scoreApplicability } from "@/features/human-review-workspace/applicability";
import {
  enrichDefinitionIncompleteLinks,
  humanReviewChecksForIncompleteRule,
} from "@/features/human-review-workspace/incompleteRuleMapping";
import {
  evidenceRefsFromContributions,
  relatedContributionIdsForCheck,
} from "@/features/human-review-workspace/linkContributions";
import { humanReviewRecordId } from "@/features/human-review-workspace/recordIds";
import { HUMAN_REVIEW_REGISTRY_V1 } from "@/features/human-review-workspace/registry/v1";
import { sanitizeHumanReviewNotes } from "@/features/human-review-workspace/sanitizeReviewNotes";
import type { HumanReviewRecord } from "@/features/human-review-workspace/types";

function relatedFindingIdsForCheck(
  intel: SiteScanIntelligence | null | undefined,
  defId: string,
  ruleIds: string[],
  incompleteRules: string[],
): string[] {
  if (!intel?.findingDetails?.length) return [];
  const ids = new Set<string>();
  for (const d of intel.findingDetails) {
    if (ruleIds.includes(d.ruleId)) ids.add(d.findingId);
  }
  for (const ruleId of incompleteRules) {
    if (humanReviewChecksForIncompleteRule(ruleId).includes(defId)) {
      dRuleFindings(intel, ruleId).forEach((id) => ids.add(id));
    }
  }
  return [...ids];
}

function dRuleFindings(
  intel: SiteScanIntelligence,
  ruleId: string,
): string[] {
  return intel.findingDetails
    .filter((d) => d.ruleId === ruleId)
    .map((d) => d.findingId);
}

function incompleteRuleIds(intel: SiteScanIntelligence | null | undefined): string[] {
  if (!intel?.normalizedFindings?.length) return [];
  return [
    ...new Set(
      intel.normalizedFindings
        .filter((f) => f.status === "review" && f.sourceType === "axe")
        .map((f) => f.ruleId)
        .filter(Boolean) as string[],
    ),
  ];
}

export function migrateLegacyManualReview(
  manualReview: ManualReviewEntry[],
  existing: HumanReviewRecord[],
): HumanReviewRecord[] {
  if (existing.length > 0) return existing;
  const now = new Date().toISOString();
  return manualReview.map((entry) => {
    const def = HUMAN_REVIEW_REGISTRY_V1.find((d) => d.id === entry.itemId);
    const reviewedAt =
      entry.status !== "not_reviewed" ? now : undefined;
    return {
      reviewId: humanReviewRecordId(entry.itemId),
      checkDefinitionId: entry.itemId,
      checkDefinitionVersion: def?.version ?? 1,
      title: def?.title ?? entry.itemId,
      category: def?.category ?? "general",
      description: def?.description ?? "",
      whyHumanReviewRequired:
        def?.whyHumanReviewRequired ?? "Human judgment required.",
      applicableScope: { kind: "site" },
      applicability: "relevant",
      relatedFindingIds: [],
      relatedRuleIds: def?.relatedAutomatedRuleIds ?? [],
      relatedContributionIds: [],
      procedureSteps: def?.procedureSteps ?? [],
      status: entry.status,
      notes: sanitizeHumanReviewNotes(entry.note),
      evidenceReferences: [],
      createdAt: now,
      updatedAt: now,
      reviewedAt,
      provenance: "human_review",
      reportInclusion: "default",
    };
  });
}

export function ensureHumanReviewRecords(input: {
  records: HumanReviewRecord[];
  manualReview: ManualReviewEntry[];
  completedPages: WebsitePageScanResult[];
  intel: SiteScanIntelligence | null | undefined;
  contributions: ReportContribution[];
  urlsSelected: number;
}): HumanReviewRecord[] {
  const migrated =
    input.records.length > 0
      ? input.records
      : migrateLegacyManualReview(input.manualReview, input.records);

  const metadata = mergePageMetadata(input.completedPages);
  const mobileViewportScanned = input.completedPages.some(
    (p) => p.viewport.id === "mobile",
  );
  const incompleteRules = incompleteRuleIds(input.intel);
  const now = new Date().toISOString();

  const byId = new Map(migrated.map((r) => [r.reviewId, r]));

  for (const def of HUMAN_REVIEW_REGISTRY_V1) {
    const reviewId = humanReviewRecordId(def.id);
    const applicability = scoreApplicability(def, metadata, {
      mobileViewportScanned,
    });
    const uniqueFindingIds = relatedFindingIdsForCheck(
      input.intel,
      def.id,
      def.relatedAutomatedRuleIds,
      incompleteRules,
    );
    const relatedContribs = relatedContributionIdsForCheck(
      def,
      input.contributions,
      uniqueFindingIds,
    );
    const existing = byId.get(reviewId);
    const relatedIncomplete = enrichDefinitionIncompleteLinks(
      def.id,
      incompleteRules,
    );

    const base: HumanReviewRecord = existing ?? {
      reviewId,
      checkDefinitionId: def.id,
      checkDefinitionVersion: def.version,
      title: def.title,
      category: def.category,
      description: def.description,
      whyHumanReviewRequired: def.whyHumanReviewRequired,
      applicableScope: {
        kind: "site",
        representativeLabel:
          input.urlsSelected > 1
            ? `Selected scan pages (${input.urlsSelected}) — representative review does not confirm every page unless scoped per page.`
            : undefined,
      },
      applicability,
      relatedFindingIds: uniqueFindingIds,
      relatedRuleIds: def.relatedAutomatedRuleIds,
      relatedContributionIds: relatedContribs.map((c) => c.contributionId),
      procedureSteps: def.procedureSteps,
      status: "not_reviewed",
      evidenceReferences: evidenceRefsFromContributions(relatedContribs),
      createdAt: now,
      updatedAt: now,
      provenance: "human_review",
      reportInclusion: "default",
      relatedIncompleteRuleIds: relatedIncomplete,
    };

    byId.set(reviewId, {
      ...base,
      applicability,
      relatedFindingIds: uniqueFindingIds,
      relatedRuleIds: def.relatedAutomatedRuleIds,
      relatedContributionIds: relatedContribs.map((c) => c.contributionId),
      evidenceReferences: evidenceRefsFromContributions(relatedContribs),
      relatedIncompleteRuleIds: relatedIncomplete,
      updatedAt: existing?.updatedAt ?? now,
    });
  }

  return [...byId.values()];
}

export function applyHumanReviewStatusUpdate(
  records: HumanReviewRecord[],
  checkDefinitionId: string,
  status: HumanReviewRecord["status"],
  note?: string,
  decisionReason?: HumanReviewRecord["decisionReason"],
): HumanReviewRecord[] {
  const now = new Date().toISOString();
  const reviewId = humanReviewRecordId(checkDefinitionId);
  return records.map((r) => {
    if (r.reviewId !== reviewId && r.checkDefinitionId !== checkDefinitionId) {
      return r;
    }
    const reviewedAt =
      status !== "not_reviewed" ? r.reviewedAt ?? now : undefined;
    return {
      ...r,
      status,
      notes: note !== undefined ? sanitizeHumanReviewNotes(note) : r.notes,
      decisionReason: decisionReason ?? r.decisionReason,
      updatedAt: now,
      reviewedAt: status === "not_reviewed" ? undefined : reviewedAt ?? now,
    };
  });
}
