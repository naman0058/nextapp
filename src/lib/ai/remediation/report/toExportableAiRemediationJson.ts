import type { ReportAiRemediationEntry } from "@/features/reports/types/reportAiRemediation";

export type ExportableAiRemediationJsonEntry = {
  id: string;
  source: string;
  sourceReference: string;
  title: string;
  generatedAt?: string;
  promptVersion?: string;
  schemaVersion?: string;
  framework?: string | null;
  stale?: boolean;
  staleReason?: string | null;
  sampleLabel?: string;
  facts?: ReportAiRemediationEntry["facts"];
  remediation: ReportAiRemediationEntry["remediation"];
};

export function toExportableAiRemediationJson(
  entries: ReportAiRemediationEntry[],
): ExportableAiRemediationJsonEntry[] {
  return entries
    .filter((e) => e.inclusionStatus === "selected")
    .map((e) => ({
      id: e.id,
      source: e.source,
      sourceReference: e.sourceReference,
      title: e.title,
      generatedAt: e.generatedAt,
      promptVersion: e.promptVersion,
      schemaVersion: e.schemaVersion,
      framework: e.framework ?? null,
      stale: e.stale,
      staleReason: e.staleReason ?? null,
      sampleLabel: e.sampleLabel,
      facts: e.facts,
      remediation: e.remediation,
    }));
}
