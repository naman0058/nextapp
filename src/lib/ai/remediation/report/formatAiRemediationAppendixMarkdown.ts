import type {
  ReportAiRemediationAppendix,
  ReportAiRemediationEntry,
} from "@/features/reports/types/reportAiRemediation";
import { formatAiRemediationMarkdown } from "@/lib/ai/remediation/utils/formatAiRemediationMarkdown";

function factsMarkdown(entry: ReportAiRemediationEntry): string {
  const f = entry.facts;
  if (!f) return "";
  const lines: string[] = ["### Deterministic evidence (authoritative)"];
  if (f.ruleId) lines.push(`- Rule: ${f.ruleId}`);
  if (f.wcag) lines.push(`- WCAG: ${f.wcag}`);
  if (f.impact) lines.push(`- Impact: ${f.impact}`);
  if (f.priority) lines.push(`- Priority: ${f.priority}`);
  if (f.pageReference) lines.push(`- Pages: ${f.pageReference}`);
  if (f.occurrenceCount != null) lines.push(`- Occurrences: ${f.occurrenceCount}`);
  if (f.measuredRatio) lines.push(`- Measured ratio: ${f.measuredRatio}`);
  if (f.requiredThreshold) lines.push(`- Required threshold: ${f.requiredThreshold}`);
  if (f.contrastResult) lines.push(`- Pass/fail: ${f.contrastResult}`);
  if (f.suggestedDeterministicColor)
    lines.push(`- Deterministic suggested color: ${f.suggestedDeterministicColor}`);
  if (f.originalContent) lines.push(`- Original content: ${f.originalContent}`);
  if (f.originalCue) lines.push(`- Original cue (${f.cueTimestamp ?? "time"}): ${f.originalCue}`);
  if (f.imageAnalysisSource) lines.push(`- ${f.imageAnalysisSource}`);
  if (f.batchRow != null) lines.push(`- Batch row ${f.batchRow}, field: ${f.batchField ?? ""}`);
  return lines.join("\n");
}

export function formatAiRemediationAppendixMarkdown(
  appendix: ReportAiRemediationAppendix,
): string {
  const parts: string[] = [
    "# AI-Assisted Remediation Appendix",
    "",
    appendix.sampleLabel ? `**${appendix.sampleLabel}**` : "**AI-Assisted** — not verified or certified.",
    "",
    appendix.intro,
    "",
  ];
  for (const entry of appendix.entries) {
    parts.push(`---`);
    if (entry.sampleLabel) parts.push(`> ${entry.sampleLabel}`);
    if (entry.stale) parts.push(`> **Stale guidance:** ${entry.staleReason ?? "Previous scan"}`);
    parts.push(formatAiRemediationMarkdown(entry.remediation));
    const facts = factsMarkdown(entry);
    if (facts) parts.push(facts);
    parts.push("");
  }
  return parts.join("\n").trim();
}
