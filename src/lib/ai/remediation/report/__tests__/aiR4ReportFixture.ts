import type { ReportAiRemediationCandidate } from "@/features/reports/types/reportAiRemediation";
import type { AIRemediationReport } from "@/lib/ai/remediation/types";

const baseReport = (source: AIRemediationReport["source"], title: string): AIRemediationReport => ({
  version: "1.0",
  source,
  title,
  problemSummary: "Summary",
  whyItMatters: "Why",
  recommendedApproach: ["Step one"],
  suggestedCode: {
    language: "html",
    code: '<button type="button">Save</button>',
    explanation: "Pattern only",
  },
  suggestedContent: null,
  alternatives: [],
  mistakesToAvoid: ["Avoid empty labels"],
  acceptanceCriteria: ["Criterion A"],
  verificationSteps: ["Verify manually"],
  humanReview: ["Human check"],
  assumptions: ["Assume dev context"],
  limitations: ["Not certified"],
});

export const aiR4AllSourceCandidates: ReportAiRemediationCandidate[] = [
  {
    id: "website-g1",
    source: "website",
    sourceReference: "g1",
    title: "Website root cause",
    generatedAt: "2026-01-01T00:00:00.000Z",
    remediation: baseReport("website", "Website root cause"),
    stale: false,
    facts: { ruleId: "button-name", impact: "critical", occurrenceCount: 3 },
  },
  {
    id: "website-stale",
    source: "website",
    sourceReference: "stale-g",
    title: "Stale website guidance",
    remediation: baseReport("website", "Stale website guidance"),
    stale: true,
    staleReason: "Generated from previous scan evidence",
    facts: { ruleId: "color-contrast" },
  },
  {
    id: "social-caption",
    source: "social",
    sourceReference: "caption",
    title: "Social caption",
    remediation: {
      ...baseReport("social", "Social caption"),
      suggestedContent: "Revised caption #accessibility",
    },
    facts: { originalContent: "Old caption" },
  },
  {
    id: "image-alt",
    source: "image",
    sourceReference: "alt",
    title: "Image alt",
    remediation: baseReport("image", "Image alt"),
    facts: { imageAnalysisSource: "Text/context-only remediation; image visual analysis was not available." },
  },
  {
    id: "contrast-design",
    source: "contrast",
    sourceReference: "contrast",
    title: "Contrast guidance",
    remediation: baseReport("contrast", "Contrast guidance"),
    facts: { measuredRatio: "3.2:1", requiredThreshold: "4.5", contrastResult: "Fail AA" },
  },
  {
    id: "video-cue-1",
    source: "video",
    sourceReference: "cue-1",
    title: "Video cue",
    remediation: {
      ...baseReport("video", "Video cue"),
      suggestedContent: "Revised cue text",
    },
    facts: { originalCue: "Original cue", cueTimestamp: "00:01.000" },
  },
  {
    id: "batch-item-1-caption",
    source: "batch",
    sourceReference: "row-1",
    title: "Batch caption",
    remediation: baseReport("batch", "Batch caption"),
    facts: { batchRow: 2, batchField: "caption", originalContent: "Import caption" },
  },
];

export const hostileRemediation: AIRemediationReport = {
  ...baseReport("website", '<script>alert(1)</script>'),
  problemSummary: '<script>alert(1)</script>',
  recommendedApproach: ['=HYPERLINK("http://evil.test")', "+cmd|' /C calc'!A0", "@SUM(1+1)"],
  suggestedCode: {
    language: "html",
    code: '<img src=x onerror=alert(1)>',
    explanation: "@SUM(1+1)",
  },
};
