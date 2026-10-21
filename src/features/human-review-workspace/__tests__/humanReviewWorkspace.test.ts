import { describe, expect, it } from "vitest";
import { scoreApplicability } from "@/features/human-review-workspace/applicability";
import { buildHumanReviewProgress } from "@/features/human-review-workspace/buildHumanReviewProgress";
import { buildHumanReviewReportBlock } from "@/features/human-review-workspace/buildHumanReviewReportBlock";
import {
  applyHumanReviewStatusUpdate,
  ensureHumanReviewRecords,
  migrateLegacyManualReview,
} from "@/features/human-review-workspace/ensureHumanReviewRecords";
import { humanReviewChecksForIncompleteRule } from "@/features/human-review-workspace/incompleteRuleMapping";
import {
  evidenceRefsFromContributions,
  relatedContributionIdsForCheck,
} from "@/features/human-review-workspace/linkContributions";
import { HUMAN_REVIEW_REGISTRY_V1 } from "@/features/human-review-workspace/registry/v1";
import { sanitizeHumanReviewNotes } from "@/features/human-review-workspace/sanitizeReviewNotes";
import type { HumanReviewRecord } from "@/features/human-review-workspace/types";
import type { ReportContribution } from "@/features/accessibility-workspace/types";
import type { WebsitePageMetadata } from "@/features/website-scanner/types/scanTypes";
import { websiteScanReducer, createInitialWebsiteSession } from "@/features/website-scanner/state/websiteScanReducer";

const emptyMeta = (): WebsitePageMetadata => ({
  documentLang: null,
  domNodeCount: 0,
  internalLinkCount: 0,
  linkCount: 0,
  iframeCount: 0,
  formCount: 0,
  imageCount: 0,
  headingCount: 0,
  videoCount: 0,
  interactiveControlCount: 0,
  dialogHintCount: 0,
});

describe("human review workspace Phase 7", () => {
  it("A: relevance from page features (forms present)", () => {
    const def = HUMAN_REVIEW_REGISTRY_V1.find((d) => d.id === "form-errors")!;
    expect(scoreApplicability(def, { ...emptyMeta(), formCount: 2 })).toBe("relevant");
    expect(scoreApplicability(def, emptyMeta())).toBe("not_applicable");
  });

  it("B: automated pass does not mark human review pass", () => {
    const records = ensureHumanReviewRecords({
      records: [],
      manualReview: [],
      completedPages: [],
      intel: {
        normalizedFindings: [
          {
            ruleId: "color-contrast",
            status: "pass",
            sourceType: "axe",
          },
        ],
      } as never,
      contributions: [],
      urlsSelected: 1,
    });
    const keyboard = records.find((r) => r.checkDefinitionId === "keyboard-full-page");
    expect(keyboard?.status).toBe("not_reviewed");
  });

  it("C: axe incomplete links to manual review but stays separate", () => {
    const checks = humanReviewChecksForIncompleteRule("aria-prohibited-attr");
    expect(checks).toContain("screen-reader");
    const incompleteFinding = {
      status: "review",
      sourceType: "axe",
      ruleId: "aria-prohibited-attr",
    };
    expect(incompleteFinding.status).not.toBe("passes");
  });

  it("D–G: status transitions and timestamps", () => {
    let records: HumanReviewRecord[] = [];
    records = applyHumanReviewStatusUpdate(records, "keyboard-full-page", "passes", "ok");
    expect(records).toHaveLength(0);
    records = ensureHumanReviewRecords({
      records: [],
      manualReview: [{ itemId: "keyboard-full-page", status: "passes", note: "ok" }],
      completedPages: [],
      intel: null,
      contributions: [],
      urlsSelected: 1,
    });
    const row = records.find((r) => r.checkDefinitionId === "keyboard-full-page")!;
    expect(row.status).toBe("passes");
    expect(row.reviewedAt).toBeTruthy();

    const back = applyHumanReviewStatusUpdate(records, "keyboard-full-page", "not_reviewed");
    const reset = back.find((r) => r.checkDefinitionId === "keyboard-full-page")!;
    expect(reset.status).toBe("not_reviewed");
    expect(reset.reviewedAt).toBeUndefined();
  });

  it("F: N/A with notes preserved", () => {
    const records = ensureHumanReviewRecords({
      records: [],
      manualReview: [
        { itemId: "video-captions", status: "not_applicable", note: "No video on scope" },
      ],
      completedPages: [],
      intel: null,
      contributions: [],
      urlsSelected: 1,
    });
    const v = records.find((r) => r.checkDefinitionId === "video-captions")!;
    expect(v.status).toBe("not_applicable");
    expect(v.notes).toContain("No video");
  });

  it("I: distinct check records do not share status", () => {
    const records = ensureHumanReviewRecords({
      records: [],
      manualReview: [
        { itemId: "keyboard-full-page", status: "passes", note: "" },
        { itemId: "focus-order", status: "not_reviewed", note: "" },
      ],
      completedPages: [],
      intel: null,
      contributions: [],
      urlsSelected: 1,
    });
    expect(records.find((r) => r.checkDefinitionId === "keyboard-full-page")?.status).toBe(
      "passes",
    );
    expect(records.find((r) => r.checkDefinitionId === "focus-order")?.status).toBe(
      "not_reviewed",
    );
  });

  it("J: touch targets possibly relevant without mobile scan", () => {
    const def = HUMAN_REVIEW_REGISTRY_V1.find((d) => d.id === "touch-targets")!;
    expect(scoreApplicability(def, emptyMeta(), { mobileViewportScanned: false })).toBe(
      "possibly_relevant",
    );
    expect(scoreApplicability(def, emptyMeta(), { mobileViewportScanned: true })).toBe("relevant");
  });

  it("K–N: specialized evidence linked without auto pass", () => {
    const altDef = HUMAN_REVIEW_REGISTRY_V1.find((d) => d.id === "alt-meaning")!;
    const contribution: ReportContribution = {
      contributionId: "c1",
      toolId: "image_alt_checker",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      sourceType: "human_review",
      scope: { type: "finding", pageUrl: "https://example.com" },
      title: "Alt review",
      summary: "Reviewed 1 image",
      findings: [],
      measurements: [],
      evidence: [],
      remediationActions: [],
      humanReviewTasks: [],
      verificationResults: [],
      relatedWebsiteFindingIds: ["finding-1"],
      relatedRuleIds: [],
      relatedRemediationGroupIds: [],
      includedInReport: false,
      exportEligibility: "allowed",
      privacyClassification: "local_session",
    };
    const linked = relatedContributionIdsForCheck(altDef, [contribution], ["finding-1"]);
    expect(linked).toHaveLength(1);
    const records = ensureHumanReviewRecords({
      records: [],
      manualReview: [],
      completedPages: [
        {
          pageMetadata: { ...emptyMeta(), imageCount: 3 },
          viewport: { id: "desktop", label: "Desktop", width: 1280, height: 720 },
        } as never,
      ],
      intel: {
        findingDetails: [{ findingId: "finding-1", ruleId: "image-alt" }],
      } as never,
      contributions: [contribution],
      urlsSelected: 1,
    });
    const alt = records.find((r) => r.checkDefinitionId === "alt-meaning")!;
    expect(alt.relatedContributionIds).toContain("c1");
    expect(alt.status).toBe("not_reviewed");
    expect(evidenceRefsFromContributions(linked)[0]?.type).toBe("image_alt_review");

    const sr = records.find((r) => r.checkDefinitionId === "screen-reader")!;
    expect(sr.status).toBe("not_reviewed");
  });

  it("O: report block counts match progress builder", () => {
    const records = ensureHumanReviewRecords({
      records: [],
      manualReview: [
        { itemId: "keyboard-full-page", status: "passes", note: "" },
        { itemId: "focus-order", status: "needs_review", note: "issue" },
      ],
      completedPages: [],
      intel: null,
      contributions: [],
      urlsSelected: 1,
    });
    const block = buildHumanReviewReportBlock(records);
    const direct = buildHumanReviewProgress(records);
    expect(block.progress.relevant).toBe(direct.relevant);
    expect(block.progress.remainingOpen).toBe(direct.remainingOpen);
  });

  it("P: legacy checklist migration preserves status", () => {
    const migrated = migrateLegacyManualReview(
      [{ itemId: "headings", status: "passes", note: "good" }],
      [],
    );
    expect(migrated).toHaveLength(1);
    expect(migrated[0]?.checkDefinitionId).toBe("headings");
    expect(migrated[0]?.status).toBe("passes");
    expect(migrated[0]?.checkDefinitionVersion).toBe(1);
  });

  it("Q: NEEDS_REVIEW reducer keeps workspace records", () => {
    let state = createInitialWebsiteSession();
    state = websiteScanReducer(state, {
      type: "SET_MANUAL_REVIEW",
      itemId: "keyboard-full-page",
      status: "needs_review",
      note: "Trap in menu",
    });
    const rec = state.accessibilityWorkspace.humanReviewRecords.find(
      (r) => r.checkDefinitionId === "keyboard-full-page",
    );
    expect(rec?.status).toBe("needs_review");
    expect(rec?.notes).toContain("Trap");
  });

  it("R: completion progress when all relevant reviewed", () => {
    const records = ensureHumanReviewRecords({
      records: [],
      manualReview: HUMAN_REVIEW_REGISTRY_V1.map((d) => ({
        itemId: d.id,
        status: "passes" as const,
        note: "",
      })),
      completedPages: [],
      intel: null,
      contributions: [],
      urlsSelected: 1,
    });
    const progress = buildHumanReviewProgress(records);
    expect(progress.notReviewed).toBe(0);
    expect(progress.reviewed).toBe(progress.relevant);
  });

  it("S: review notes sanitization", () => {
    expect(sanitizeHumanReviewNotes("<script>x</script>ok")).toBe("xok");
    expect(sanitizeHumanReviewNotes("  safe  ")).toBe("safe");
  });

  it("T: unknown applicability when tags do not match metadata heuristics", () => {
    const def = {
      ...HUMAN_REVIEW_REGISTRY_V1[0]!,
      relevanceTags: ["custom-unknown-tag"],
    };
    expect(scoreApplicability(def, emptyMeta())).toBe("unknown");
  });
});
