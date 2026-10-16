import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import type { PreflightReportSourceSnapshot } from "@/features/reports/types/reportSource";
import type { ReportAiRemediationCandidate } from "@/features/reports/types/reportAiRemediation";
import type { AiRemediationEntry } from "@/lib/ai/remediation/client/aiRemediationEntry";
import {
  AI_REMEDIATION_PROMPT_VERSION,
  AI_REMEDIATION_SCHEMA_VERSION,
} from "@/lib/ai/remediation/constants";
import type { CaptionCue } from "@/features/video/types/captions";

function entryToCandidate(
  base: {
    id: string;
    source: ReportAiRemediationCandidate["source"];
    sourceReference: string;
    entry: AiRemediationEntry;
    facts?: ReportAiRemediationCandidate["facts"];
    sampleLabel?: string;
  },
): ReportAiRemediationCandidate {
  return {
    id: base.id,
    source: base.source,
    sourceReference: base.sourceReference,
    title: base.entry.report.title,
    generatedAt: base.entry.generatedAt,
    promptVersion: AI_REMEDIATION_PROMPT_VERSION,
    schemaVersion: AI_REMEDIATION_SCHEMA_VERSION,
    framework: base.entry.frameworkPreference ?? null,
    remediation: base.entry.report,
    stale: base.entry.stale,
    staleReason: base.entry.stale ? "Content or context changed since generation" : null,
    facts: base.facts,
    sampleLabel: base.sampleLabel,
  };
}

export function collectSocialRemediationCandidate(
  entry: AiRemediationEntry | null | undefined,
  originalCaption: string,
): ReportAiRemediationCandidate | null {
  if (!entry?.report) return null;
  return entryToCandidate({
    id: "social-caption",
    source: "social",
    sourceReference: "caption",
    entry,
    facts: {
      originalContent: originalCaption,
      deterministicFinding: "Rule-based preflight findings apply separately",
    },
  });
}

export function collectImageRemediationCandidate(
  entry: AiRemediationEntry | null | undefined,
  altText: string,
  imageProvenance: "vision" | "text_only",
): ReportAiRemediationCandidate | null {
  if (!entry?.report) return null;
  return entryToCandidate({
    id: "image-alt",
    source: "image",
    sourceReference: "alt-text",
    entry,
    facts: {
      originalContent: altText.trim() || undefined,
      imageAnalysisSource:
        imageProvenance === "vision"
          ? "Based on existing AI image observations"
          : "Text/context-only remediation; image visual analysis was not available.",
    },
  });
}

export function collectContrastRemediationCandidate(
  entry: AiRemediationEntry | null | undefined,
  facts: ReportAiRemediationCandidate["facts"],
): ReportAiRemediationCandidate | null {
  if (!entry?.report) return null;
  return entryToCandidate({
    id: "contrast-design",
    source: "contrast",
    sourceReference: "contrast-check",
    entry,
    facts,
  });
}

export function collectVideoCueRemediationCandidates(
  byCueId: Record<string, AiRemediationEntry> | undefined,
  cues: CaptionCue[],
): ReportAiRemediationCandidate[] {
  if (!byCueId) return [];
  const out: ReportAiRemediationCandidate[] = [];
  for (const [cueId, entry] of Object.entries(byCueId)) {
    if (!entry.report) continue;
    const cue = cues.find((c) => c.id === cueId);
    out.push(
      entryToCandidate({
        id: `video-cue-${cueId}`,
        source: "video",
        sourceReference: cueId,
        entry,
        facts: {
          originalCue: cue?.text,
          cueTimestamp: cue != null ? String(cue.start) : undefined,
          deterministicFinding: "Caption QA findings apply separately",
        },
      }),
    );
  }
  return out;
}

export function collectBatchRemediationCandidate(
  item: BatchAccessibilityItem,
): ReportAiRemediationCandidate | null {
  const rem = item.remediation;
  if (!rem?.report) return null;
  const target = rem.target;
  const original =
    target === "caption" ? item.caption : target === "alt" ? item.altText : "";
  return {
    id: `batch-${item.id}-${target}`,
    source: "batch",
    sourceReference: item.id,
    title: rem.report.title,
    generatedAt: rem.completedAt,
    promptVersion: AI_REMEDIATION_PROMPT_VERSION,
    schemaVersion: AI_REMEDIATION_SCHEMA_VERSION,
    framework: null,
    remediation: rem.report,
    stale: false,
    facts: {
      batchRow: item.sourceRow,
      batchField: target === "alt" ? "alt" : "caption",
      originalContent: original,
      itemReference: item.id,
    },
  };
}

export function collectAllFromReportSource(
  source: PreflightReportSourceSnapshot,
): ReportAiRemediationCandidate[] {
  if (source.aiRemediationCandidates?.length) {
    return [...source.aiRemediationCandidates];
  }
  return [];
}
