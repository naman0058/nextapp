import { describe, expect, it } from "vitest";
import { buildBatchRemediationContext } from "@/lib/ai/remediation/adapters/buildBatchRemediationContext";
import { buildContrastRemediationContext } from "@/lib/ai/remediation/adapters/buildContrastRemediationContext";
import { buildImageRemediationContext } from "@/lib/ai/remediation/adapters/buildImageRemediationContext";
import { buildSocialRemediationContext } from "@/lib/ai/remediation/adapters/buildSocialRemediationContext";
import { buildVideoRemediationContext } from "@/lib/ai/remediation/adapters/buildVideoRemediationContext";
import { planBatchRemediationRun } from "@/features/batch/utils/ai/planBatchRemediationRun";
import type { PreflightAnalysisResult } from "@/features/accessibility/types/preflight";

const baseResults: PreflightAnalysisResult = {
  checks: [
    {
      id: "excessive-caps",
      category: "caption",
      title: "Excessive caps",
      status: "review",
      severity: "warning",
      summary: "Many words are ALL CAPS",
    },
  ],
  score: 70,
  scoreBandLabel: "Needs work",
  counts: { pass: 5, review: 1, fail: 0, not_checked: 0 },
};

describe("buildSocialRemediationContext", () => {
  it("includes social fingerprint prefix material", () => {
    const { facts } = buildSocialRemediationContext({
      platform: "instagram",
      originalCaption: "SALE NOW https://example.com",
      workingCaption: "SALE NOW https://example.com",
      hasImage: false,
      results: baseResults,
    });
    expect(String(facts.issueFingerprint)).toMatch(/^[a-f0-9]{24}$/);
    expect(facts.originalCaption).toBe("SALE NOW https://example.com");
  });

  it("preserves factual marketing fields in originalCaption evidence", () => {
    const original =
      "$29.99 — 20% off until October 25 at 10 AM. https://example.com/sale — ABC Foundation";
    const { facts, deterministicGuidance } = buildSocialRemediationContext({
      platform: "facebook",
      originalCaption: original,
      workingCaption: original,
      hasImage: false,
      results: baseResults,
    });
    expect(facts.originalCaption).toBe(original);
    expect(facts.preserveMeaning).toBe(true);
    expect(deterministicGuidance.some((g) => g.includes("URLs"))).toBe(true);
  });

  it("handles emoji-heavy caption", () => {
    const { facts } = buildSocialRemediationContext({
      platform: "x",
      originalCaption: "🎉🎉 Launch day!!!",
      workingCaption: "🎉🎉 Launch day!!!",
      hasImage: false,
      results: baseResults,
    });
    expect(facts.platform).toBe("x");
  });
});

describe("buildImageRemediationContext", () => {
  it("does not include image blob fields", () => {
    const { facts } = buildImageRemediationContext({
      sourceTool: "social_checker",
      userAltText: "photo",
      hasImage: true,
      results: baseResults,
      aiAnalysis: null,
    });
    expect(JSON.stringify(facts)).not.toMatch(/blob|base64/i);
    expect(facts.imageAnalysisAvailable).toBe(false);
  });
});

describe("buildContrastRemediationContext", () => {
  it("marks contrast as authoritative", () => {
    const { facts } = buildContrastRemediationContext({
      foreground: { r: 200, g: 200, b: 200 },
      background: { r: 255, g: 255, b: 255 },
      foregroundHex: "#C8C8C8",
      backgroundHex: "#FFFFFF",
      textType: "normal",
      evaluation: {
        ratio: 1.5,
        displayRatio: "1.5:1",
        aaNormal: "fail",
        aaLarge: "fail",
        aaaNormal: "fail",
        aaaLarge: "fail",
        requiredRatio: 4.5,
        primaryVerdict: "fail",
        primaryLabel: "FAIL — Normal Text AA",
      },
    });
    expect(facts.doNotRecalculate).toBe(true);
    expect(facts.measuredRatio).toBe(1.5);
  });
});

describe("buildVideoRemediationContext fact cues", () => {
  it("preserves numeric and quarter facts in originalCueText evidence", () => {
    const text = "Revenue increased by 18% in Q2.";
    const cues = [{ id: "1", start: 0, end: 2, text }];
    const { facts, deterministicGuidance } = buildVideoRemediationContext({
      platform: "linkedin",
      cue: cues[0]!,
      cues,
      qualityFindings: [],
      speakerLabelsUserSet: false,
    });
    expect(facts.originalCueText).toBe(text);
    expect(deterministicGuidance.some((g) => g.includes("spoken facts"))).toBe(true);
  });
});

describe("buildVideoRemediationContext", () => {
  it("bounds cue context without full transcript", () => {
    const cues = [
      { id: "1", start: 0, end: 2, text: "Hello world" },
      { id: "2", start: 2, end: 4, text: "Second cue" },
    ];
    const { facts } = buildVideoRemediationContext({
      platform: "linkedin",
      cue: cues[1]!,
      cues,
      qualityFindings: [],
      speakerLabelsUserSet: false,
    });
    expect(facts.originalCueText).toBe("Second cue");
    expect(JSON.stringify(facts)).not.toMatch(/fullTranscript|videoBlob/i);
  });
});

describe("fingerprint isolation", () => {
  const text = "Same text for isolation test";

  it("differs social vs video for same string", () => {
    const social = buildSocialRemediationContext({
      platform: "facebook",
      originalCaption: text,
      workingCaption: text,
      hasImage: false,
      results: baseResults,
    });
    const video = buildVideoRemediationContext({
      platform: "facebook",
      cue: { id: "c1", start: 0, end: 1, text },
      cues: [{ id: "c1", start: 0, end: 1, text }],
      qualityFindings: [],
      speakerLabelsUserSet: false,
    });
    expect(social.facts.issueFingerprint).not.toBe(video.facts.issueFingerprint);
  });

  it("differs social vs batch", () => {
    const social = buildSocialRemediationContext({
      platform: "facebook",
      originalCaption: text,
      workingCaption: text,
      hasImage: false,
      results: baseResults,
    });
    const batch = buildBatchRemediationContext({
      batchItemId: "row-1",
      platform: "facebook",
      originalCaption: text,
      altText: "",
      remediationTarget: "caption",
      localAnalysis: {
        phase1: baseResults,
        screenReaderSummary: {
          level: "review" as const,
          label: "Review",
          noiseSourceCount: 1,
          repeatedEmojis: false,
          fancyUnicode: false,
          excessHashtags: false,
          duplicateCaptionAlt: false,
          genericLinkLanguage: false,
        },
        noiseCount: 0,
        platformChecklist: [],
        issueCount: 1,
        captionIssueCount: 1,
        humanReviewCount: 0,
      },
    });
    expect(social.facts.issueFingerprint).not.toBe(batch.facts.issueFingerprint);
  });
});

describe("planBatchRemediationRun", () => {
  it("respects cap and selected only", () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      id: `item-${i}`,
      sourceRow: i,
      platform: "instagram" as const,
      platformSource: "csv" as const,
      caption: "Hi",
      altText: "",
      altTextSource: "none" as const,
      image: null,
      validation: { severity: "valid" as const, messages: [], canAnalyze: true },
      localAnalysis: {
        phase1: baseResults,
        screenReaderSummary: {
          level: "review" as const,
          label: "Review",
          noiseSourceCount: 1,
          repeatedEmojis: false,
          fancyUnicode: false,
          excessHashtags: false,
          duplicateCaptionAlt: false,
          genericLinkLanguage: false,
        },
        noiseCount: 0,
        platformChecklist: [],
        issueCount: 1,
        captionIssueCount: 1,
        humanReviewCount: 0,
      },
      ai: { status: "not_run" as const, analysis: null, fingerprint: null },
      remediation: {
        status: "not_run" as const,
        target: "caption" as const,
        report: null,
        fingerprint: null,
      },
      visualStatus: { contrast: "not_checked" as const },
      humanReviewItems: [],
      rowReview: {
        altTextVerified: false,
        imageTextVerified: false,
        platformPublishingReviewed: false,
      },
      overallStatus: "Needs Review" as const,
      processingState: "local_complete" as const,
      importWarnings: [],
    }));
    const plan = planBatchRemediationRun(
      items,
      items.map((i) => i.id),
      0,
      "caption",
    );
    expect(plan.cappedCount).toBeLessThanOrEqual(5);
    expect(plan.eligibleIds.length).toBe(plan.cappedCount);
  });
});
