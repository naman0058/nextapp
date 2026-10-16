import type { AIRemediationReport, CodeFramework, RemediationFacts } from "@/lib/ai/remediation/types";

export type AiRemediationEntry = {
  report: AIRemediationReport;
  facts: RemediationFacts;
  stale: boolean;
  generatedAt: string;
  cached?: boolean;
  frameworkPreference?: CodeFramework;
};
