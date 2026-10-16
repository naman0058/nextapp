import { describe, expect, it } from "vitest";
import { validateAiRemediationReport } from "@/lib/ai/remediation/validateAiRemediationReport";
import { formatAiRemediationMarkdown } from "@/lib/ai/remediation/utils/formatAiRemediationMarkdown";

const hostile = '<script>alert(1)</script>';

describe("AI-R3 report safety gate", () => {
  it("accepts hostile strings in validated report fields as literal text", () => {
    const raw = {
      version: "1.0",
      source: "social",
      title: hostile,
      problemSummary: hostile,
      whyItMatters: "Why",
      recommendedApproach: [hostile],
      suggestedContent: hostile,
      alternatives: [
        {
          label: "Alt",
          explanation: hostile,
          content: hostile,
          code: null,
        },
      ],
      mistakesToAvoid: [hostile],
      acceptanceCriteria: ["Check"],
      verificationSteps: ["Verify"],
      humanReview: ["Review"],
      assumptions: ["Assume"],
      limitations: ["Limit"],
      suggestedCode: {
        language: "html",
        code: hostile,
        explanation: hostile,
      },
    };
    const result = validateAiRemediationReport(raw, "social");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.problemSummary).toBe(hostile);
    const md = formatAiRemediationMarkdown(result.data);
    expect(md).toContain(hostile);
    expect(md).not.toContain("&lt;script&gt;");
  });
});
