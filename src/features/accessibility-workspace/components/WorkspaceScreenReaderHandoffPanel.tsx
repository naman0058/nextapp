"use client";

import { useState } from "react";
import type { ToolHandoffContext } from "@/features/accessibility-workspace/types";
import { readToolHandoff, queuePendingContribution } from "@/features/accessibility-workspace/handoffStorage";
import { buildScreenReaderPreviewContribution } from "@/features/accessibility-workspace/buildScreenReaderContribution";
import { WorkspaceAddToReportActions } from "@/features/accessibility-workspace/components/WorkspaceAddToReportActions";

export function WorkspaceScreenReaderHandoffPanel() {
  const [handoff] = useState<ToolHandoffContext | null>(() => {
    const ctx = readToolHandoff();
    return ctx?.toolId === "screen_reader_preview" ? ctx : null;
  });
  const [userNote, setUserNote] = useState("");

  if (!handoff) return null;

  const observationSummary = `Preview observation for ${handoff.returnTo.label} (${handoff.ruleId}). Not assistive technology testing.`;

  function save(includedInReport: boolean) {
    if (!handoff) return;
    queuePendingContribution(
      buildScreenReaderPreviewContribution({
        handoff,
        observationSummary,
        userNote: userNote.trim() || undefined,
        includedInReport,
      }),
    );
  }

  return (
    <section
      aria-labelledby="sr-handoff-heading"
      className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm"
    >
      <h2 id="sr-handoff-heading" className="font-semibold">
        Opened from Website Scanner finding
      </h2>
      <p className="mt-1 text-muted">{observationSummary}</p>
      <label className="mt-3 block text-xs font-medium">
        Your observation notes (optional)
        <textarea
          className="mt-1 w-full rounded border border-border bg-background p-2 text-sm"
          rows={3}
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
        />
      </label>
      <WorkspaceAddToReportActions
        primaryLabel="Add Screen Reader Preview observation to report"
        onPrimary={save}
        onSecondary={save}
      />
    </section>
  );
}
