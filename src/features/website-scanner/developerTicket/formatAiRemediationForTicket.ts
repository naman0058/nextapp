import type { AIRemediationReport } from "@/lib/ai/remediation/types";

export function formatAiRemediationForTicket(report: AIRemediationReport): {
  plainLanguageExplanation: string;
  suggestedFixes: string[];
  developerExample?: string | null;
} {
  return {
    plainLanguageExplanation: `${report.problemSummary}\n\n${report.whyItMatters}`,
    suggestedFixes: [
      ...report.recommendedApproach,
      ...report.verificationSteps.map((s) => `Verify: ${s}`),
    ].slice(0, 12),
    developerExample: report.suggestedCode?.code ?? null,
  };
}
