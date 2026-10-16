import {
  AI_REMEDIATION_APPENDIX_INTRO,
  type ReportAiRemediationAppendix,
  type ReportAiRemediationCandidate,
  type ReportAiRemediationEntry,
} from "@/features/reports/types/reportAiRemediation";

export function dedupeReportAiCandidates(
  candidates: ReportAiRemediationCandidate[],
): ReportAiRemediationCandidate[] {
  const seen = new Set<string>();
  const out: ReportAiRemediationCandidate[] = [];
  for (const c of candidates) {
    if (!c.remediation?.title?.trim() || !c.remediation.version) continue;
    const key = `${c.source}:${c.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

export type AiRemediationSelectionInput = {
  includeAppendix: boolean;
  selectedIds: Set<string> | string[];
  /** When true, stale entries can be included if explicitly selected */
  allowStaleWhenSelected?: boolean;
  sampleLabel?: string;
};

function isSelected(
  id: string,
  selection: AiRemediationSelectionInput,
  stale: boolean,
): boolean {
  if (!selection.includeAppendix) return false;
  const ids =
    selection.selectedIds instanceof Set
      ? selection.selectedIds
      : new Set(selection.selectedIds);
  if (!ids.has(id)) return false;
  if (stale && !selection.allowStaleWhenSelected) return false;
  return true;
}

export function buildReportAiRemediationAppendix(
  candidates: ReportAiRemediationCandidate[],
  selection: AiRemediationSelectionInput,
): ReportAiRemediationAppendix | undefined {
  const normalized = dedupeReportAiCandidates(candidates);
  if (!selection.includeAppendix || normalized.length === 0) {
    return undefined;
  }

  const entries: ReportAiRemediationEntry[] = normalized.map((c) => {
    const stale = Boolean(c.stale);
    const selected = isSelected(c.id, selection, stale);
    return {
      ...c,
      inclusionStatus: selected ? "selected" : "excluded",
      sampleLabel: selection.sampleLabel ?? c.sampleLabel,
    };
  });

  const included = entries.filter((e) => e.inclusionStatus === "selected");
  if (included.length === 0) {
    return undefined;
  }

  return {
    intro: AI_REMEDIATION_APPENDIX_INTRO,
    entries: included,
    includedCount: included.length,
    sampleLabel: selection.sampleLabel,
  };
}

export function aiRemediationIncludedSummaryLine(count: number): string | undefined {
  if (count <= 0) return undefined;
  return `AI-assisted remediation included for ${count} selected item${count === 1 ? "" : "s"}.`;
}
