"use client";

import { useState } from "react";
import type { ToolHandoffContext } from "@/features/accessibility-workspace/types";
import { readToolHandoff, queuePendingContribution } from "@/features/accessibility-workspace/handoffStorage";
import { buildVideoAccessibilityContribution } from "@/features/accessibility-workspace/buildVideoContribution";
import { WorkspaceAddToReportActions } from "@/features/accessibility-workspace/components/WorkspaceAddToReportActions";

export function WorkspaceVideoHandoffPanel() {
  const [handoff] = useState<ToolHandoffContext | null>(() => {
    const ctx = readToolHandoff();
    return ctx?.toolId === "video_accessibility" ? ctx : null;
  });
  const [captionsReviewed, setCaptionsReviewed] = useState(false);
  const [transcriptReviewed, setTranscriptReviewed] = useState(false);
  const [note, setNote] = useState("");

  if (!handoff) return null;

  function save(includedInReport: boolean) {
    if (!handoff) return;
    queuePendingContribution(
      buildVideoAccessibilityContribution({
        handoff,
        captionsReviewed,
        transcriptReviewed,
        userConfirmationNote: note.trim() || undefined,
        includedInReport,
      }),
    );
  }

  return (
    <section
      aria-labelledby="video-handoff-heading"
      className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm"
    >
      <h2 id="video-handoff-heading" className="font-semibold">
        Related Website Scanner media finding
      </h2>
      <p className="mt-1 text-muted">
        {handoff.returnTo.label} · {handoff.ruleId}. Review media you upload here; this does not
        verify all video on the scanned site.
      </p>
      <label className="mt-2 flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={captionsReviewed}
          onChange={(e) => setCaptionsReviewed(e.target.checked)}
        />
        I reviewed captions for my uploaded media
      </label>
      <label className="mt-2 flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={transcriptReviewed}
          onChange={(e) => setTranscriptReviewed(e.target.checked)}
        />
        I reviewed transcript text for my uploaded media
      </label>
      <label className="mt-3 block text-xs font-medium">
        Notes (optional)
        <textarea
          className="mt-1 w-full rounded border border-border bg-background p-2 text-sm"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      <WorkspaceAddToReportActions
        primaryLabel="Add video review to accessibility report"
        disabled={!captionsReviewed && !transcriptReviewed && !note.trim()}
        disabledReason="Confirm caption/transcript review or add a note before saving."
        onPrimary={save}
        onSecondary={save}
      />
    </section>
  );
}
