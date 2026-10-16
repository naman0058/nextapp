import type { ReportAiRemediationEntry } from "@/features/reports/types/reportAiRemediation";
import { formatAiRemediationMarkdown } from "@/lib/ai/remediation/utils/formatAiRemediationMarkdown";

function formatFactsBlock(entry: ReportAiRemediationEntry): string[] {
  const f = entry.facts;
  if (!f) return [];
  const lines: string[] = ["Deterministic reference (authoritative):"];
  if (f.ruleId) lines.push(`  Rule: ${f.ruleId}`);
  if (f.wcag) lines.push(`  WCAG: ${f.wcag}`);
  if (f.impact) lines.push(`  Impact: ${f.impact}`);
  if (f.priority) lines.push(`  Priority: ${f.priority}`);
  if (f.pageCount != null) lines.push(`  Pages: ${f.pageCount}`);
  if (f.occurrenceCount != null) lines.push(`  Occurrences: ${f.occurrenceCount}`);
  if (f.measuredRatio) lines.push(`  Measured ratio: ${f.measuredRatio}`);
  if (f.requiredThreshold) lines.push(`  Required threshold: ${f.requiredThreshold}`);
  if (f.contrastResult) lines.push(`  Result: ${f.contrastResult}`);
  if (f.foregroundHex) lines.push(`  Foreground: ${f.foregroundHex}`);
  if (f.backgroundHex) lines.push(`  Background: ${f.backgroundHex}`);
  if (f.suggestedDeterministicColor)
    lines.push(`  Deterministic suggested color: ${f.suggestedDeterministicColor}`);
  if (f.originalContent) lines.push(`  Original content: ${f.originalContent}`);
  if (f.originalCue) lines.push(`  Original cue: ${f.originalCue}`);
  if (f.cueTimestamp) lines.push(`  Timestamp: ${f.cueTimestamp}`);
  if (f.imageAnalysisSource) lines.push(`  Source: ${f.imageAnalysisSource}`);
  if (f.batchRow != null) lines.push(`  Batch row: ${f.batchRow}`);
  if (f.batchField) lines.push(`  Field: ${f.batchField}`);
  return lines;
}

export function formatAiRemediationEntryPlainText(entry: ReportAiRemediationEntry): string {
  const header = [
    entry.sampleLabel ? `[${entry.sampleLabel}]` : "[AI-Assisted]",
    entry.title,
    `Source: ${entry.source}`,
    entry.stale ? "Stale guidance — Generated from previous scan evidence" : "",
  ]
    .filter(Boolean)
    .join("\n");
  const facts = formatFactsBlock(entry).join("\n");
  const body = formatAiRemediationMarkdown(entry.remediation);
  return [header, facts, body].filter(Boolean).join("\n\n");
}

export function formatAiRemediationAppendixPlainText(
  entries: ReportAiRemediationEntry[],
  intro: string,
): string {
  return [
    "AI-Assisted Remediation Appendix",
    intro,
    ...entries.map((e) => formatAiRemediationEntryPlainText(e)),
  ].join("\n\n---\n\n");
}
