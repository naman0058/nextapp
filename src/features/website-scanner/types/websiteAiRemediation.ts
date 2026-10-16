import type { AIRemediationReport } from "@/lib/ai/remediation/types";
import type { CodeFramework, RemediationFacts } from "@/lib/ai/remediation/types";

export type WebsiteAiRemediationEntry = {
  report: AIRemediationReport;
  facts: RemediationFacts;
  frameworkPreference: CodeFramework;
  stale: boolean;
  generatedAt: string;
  cached?: boolean;
};
