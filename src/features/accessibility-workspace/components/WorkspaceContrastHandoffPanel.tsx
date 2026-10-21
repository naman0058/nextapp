"use client";

import { useState } from "react";
import type { ContrastEvaluation } from "@/features/accessibility/types/visualAccessibility";
import {
  buildContrastMeasurementContribution,
} from "@/features/accessibility-workspace/buildContrastContribution";
import {
  queuePendingContribution,
  readToolHandoff,
} from "@/features/accessibility-workspace/handoffStorage";
import type { ToolHandoffContext } from "@/features/accessibility-workspace/types";
import { WorkspaceAddToReportActions } from "@/features/accessibility-workspace/components/WorkspaceAddToReportActions";

type Props = {
  evaluation: ContrastEvaluation | null;
  foregroundHex: string;
  backgroundHex: string;
  textType: string;
  measured: boolean;
};

export function WorkspaceContrastHandoffPanel({
  evaluation,
  foregroundHex,
  backgroundHex,
  textType,
  measured,
}: Props) {
  const [handoff] = useState<ToolHandoffContext | null>(() => {
    const ctx = readToolHandoff();
    return ctx?.toolId === "contrast_checker" ? ctx : null;
  });

  if (!handoff) return null;

  function addToReport(includedInReport: boolean) {
    if (!handoff || !evaluation || !measured) return;
    queuePendingContribution(
      buildContrastMeasurementContribution({
        handoff,
        evaluation,
        foregroundHex,
        backgroundHex,
        textType,
        includedInReport,
      }),
    );
  }

  return (
    <section
      aria-labelledby="workspace-handoff-heading"
      className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm"
    >
      <h2 id="workspace-handoff-heading" className="font-semibold">
        Opened from Website Scanner finding
      </h2>
      <p className="mt-1 text-muted">
        {handoff.returnTo.label} · rule {handoff.ruleId}
      </p>
      {handoff.scannerTotalOccurrences && handoff.scannerTotalOccurrences > 1 ? (
        <p className="mt-2 text-xs">
          Scanner reported {handoff.scannerTotalOccurrences} occurrences. A contrast check here
          verifies only the color pair you measure — not every occurrence.
        </p>
      ) : null}
      {handoff.foregroundColor && handoff.backgroundColor ? (
        <p className="mt-2 text-xs text-muted">
          Scanner evidence hint: {handoff.foregroundColor} on {handoff.backgroundColor}
          {handoff.measuredContrastRatio ? ` (${handoff.measuredContrastRatio}:1)` : ""}.
        </p>
      ) : null}

      <WorkspaceAddToReportActions
        primaryLabel="Add this result to accessibility report"
        disabled={!measured || !evaluation}
        disabledReason="Run a contrast measurement before adding to the report."
        onPrimary={addToReport}
        onSecondary={addToReport}
      />
    </section>
  );
}
