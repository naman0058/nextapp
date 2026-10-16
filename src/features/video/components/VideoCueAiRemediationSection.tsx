"use client";

import { useMemo, useState } from "react";
import type { CaptionCue, CaptionQualitySummary } from "@/features/video/types/captions";
import type { VideoVisualAccessibilityReview } from "@/features/video/types/visualReview";
import { buildVideoRemediationContext } from "@/lib/ai/remediation/adapters/buildVideoRemediationContext";
import { AIRemediationPanel } from "@/lib/ai/remediation/components/AIRemediationPanel";
import { useAiRemediationSession } from "@/lib/ai/remediation/client/useAiRemediationSession";
import type { AiRemediationEntry } from "@/lib/ai/remediation/client/aiRemediationEntry";
import { ComparisonList } from "@/features/accessibility/components/checker/SocialAiRemediationSection";
import { formatContentComparison } from "@/lib/ai/remediation/utils/formatContentComparison";
import type { SocialPlatform } from "@/types";

type Props = {
  cue: CaptionCue;
  cues: CaptionCue[];
  platform: SocialPlatform;
  quality: CaptionQualitySummary;
  visualReview: VideoVisualAccessibilityReview | null;
  speakerLabelsUserSet: boolean;
  onApplySuggested: (cueId: string, text: string) => void;
  entry?: AiRemediationEntry | null;
  onEntryChange?: (cueId: string, entry: AiRemediationEntry) => void;
};

export function VideoCueAiRemediationSection({
  cue,
  cues,
  platform,
  quality,
  visualReview,
  speakerLabelsUserSet,
  onApplySuggested,
  entry: controlledEntry,
  onEntryChange,
}: Props) {
  const { sessionId, ready } = useAiRemediationSession();
  const [entry, setEntry] = useState<AiRemediationEntry | null>(
    controlledEntry ?? null,
  );
  const activeEntry = controlledEntry ?? entry;
  const [showCompare, setShowCompare] = useState(false);
  const [contentKey, setContentKey] = useState("");

  const visualExcerpt = useMemo(() => {
    if (!visualReview?.observations.length) return null;
    return visualReview.observations
      .slice(0, 4)
      .map((o) => `[${o.timestamp}s] ${o.category}: ${o.description}`)
      .join("\n");
  }, [visualReview]);

  const context = useMemo(
    () =>
      buildVideoRemediationContext({
        platform,
        cue,
        cues,
        qualityFindings: quality.findings,
        visualReviewExcerpt: visualExcerpt,
        speakerLabelsUserSet,
      }),
    [platform, cue, cues, quality.findings, visualExcerpt, speakerLabelsUserSet],
  );

  const scanId = String(context.facts.issueFingerprint ?? cue.id);
  const key = `${cue.id}:${cue.text}`;
  const stale = Boolean(activeEntry && contentKey !== key && contentKey !== "");

  return (
    <AIRemediationPanel
      panelId={`video-${cue.id}`}
      source="video"
      sessionId={sessionId}
      sessionReady={ready}
      scanId={scanId}
      entry={
        activeEntry ? { ...activeEntry, stale: stale || activeEntry.stale } : null
      }
      stale={stale}
      className="mt-3 border-t border-border pt-3"
      buildRequest={() => ({
        facts: context.facts,
        deterministicGuidance: context.deterministicGuidance,
      })}
      onEntry={(newEntry) => {
        setContentKey(key);
        setEntry(newEntry);
        onEntryChange?.(cue.id, newEntry);
      }}
      skipGenerateIfCached={(e) => !e.stale && contentKey === key}
      renderSuggestedContent={(report) => {
        const suggested = report.suggestedContent ?? "";
        if (!suggested) return null;
        const lines = showCompare
          ? formatContentComparison(cue.text, suggested)
          : [];
        return (
          <div>
            <p className="font-medium">Suggested caption revision</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{suggested}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                onClick={() => onApplySuggested(cue.id, suggested)}
              >
                Apply Suggested Caption Revision
              </button>
              <button
                type="button"
                className="rounded border border-border px-3 py-1.5 text-xs"
                onClick={() => setShowCompare((v) => !v)}
              >
                {showCompare ? "Hide comparison" : "Compare to original cue"}
              </button>
            </div>
            {showCompare && (
              <ComparisonList lines={lines} className="mt-2 rounded border p-2 text-xs" />
            )}
          </div>
        );
      }}
    />
  );
}
