import { describe, expect, it } from "vitest";
import { formatAiRemediationMarkdown } from "@/features/website-scanner/utils/formatAiRemediationMarkdown";
import type { AIRemediationReport } from "@/lib/ai/remediation/types";

const base: AIRemediationReport = {
  version: "1.0",
  source: "website",
  title: "Test",
  problemSummary: "Summary",
  whyItMatters: "Why",
  recommendedApproach: ["Step"],
  suggestedCode: {
    language: "html",
    code: '</code><script>alert(1)</script>',
    explanation: "Example",
  },
  suggestedContent: null,
  alternatives: [],
  mistakesToAvoid: [],
  acceptanceCriteria: ["Done"],
  verificationSteps: ["Rescan"],
  humanReview: ["Review"],
  assumptions: [],
  limitations: [],
  confidenceNote: null,
};

describe("formatAiRemediationMarkdown", () => {
  it("preserves XSS-like strings as literal text in markdown", () => {
    const md = formatAiRemediationMarkdown({
      ...base,
      problemSummary: '<img src=x onerror="alert(1)">',
    });
    expect(md).toContain('<img src=x onerror="alert(1)">');
    expect(md).toContain("</code><script>alert(1)</script>");
  });
});
