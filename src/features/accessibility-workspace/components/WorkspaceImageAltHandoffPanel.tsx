"use client";

import { useState } from "react";
import type { ToolHandoffContext } from "@/features/accessibility-workspace/types";
import { readToolHandoff } from "@/features/accessibility-workspace/handoffStorage";
import { buildImageAltContribution } from "@/features/accessibility-workspace/buildImageAltContribution";
import { queuePendingContribution } from "@/features/accessibility-workspace/handoffStorage";
import { WorkspaceAddToReportActions } from "@/features/accessibility-workspace/components/WorkspaceAddToReportActions";

export function WorkspaceImageAltHandoffPanel() {
  const [handoff] = useState<ToolHandoffContext | null>(() => {
    const ctx = readToolHandoff();
    return ctx?.toolId === "image_alt_checker" ? ctx : null;
  });
  const [proposedAlt, setProposedAlt] = useState(handoff?.existingAltText ?? "");
  const [decorative, setDecorative] = useState<"" | "decorative" | "meaningful">("");
  const [humanReviewed, setHumanReviewed] = useState(false);

  if (!handoff) return null;

  function save(includedInReport: boolean) {
    if (!handoff || !proposedAlt.trim()) return;
    const contribution = buildImageAltContribution({
      handoff,
      originalAlt: handoff.existingAltText,
      proposedAlt: proposedAlt.trim(),
      decorativeDecision: decorative || null,
      humanReviewed,
      aiSuggested: false,
      includedInReport,
    });
    queuePendingContribution(contribution);
  }

  return (
    <section
      aria-labelledby="image-alt-handoff-heading"
      className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm"
    >
      <h2 id="image-alt-handoff-heading" className="font-semibold">
        Image / alt review from Website Scanner
      </h2>
      <p className="mt-1 text-muted">
        {handoff.returnTo.label} · rule {handoff.ruleId}
      </p>
      {handoff.existingAltText ? (
        <p className="mt-2 text-xs text-muted">
          Scanner context alt hint: {handoff.existingAltText}
        </p>
      ) : null}
      <label className="mt-3 block text-xs font-medium">
        Proposed alt text
        <textarea
          className="mt-1 w-full rounded border border-border bg-background p-2 text-sm"
          rows={3}
          value={proposedAlt}
          onChange={(e) => setProposedAlt(e.target.value)}
        />
      </label>
      <fieldset className="mt-2">
        <legend className="text-xs font-medium">Decorative decision (optional)</legend>
        <label className="mr-3 text-xs">
          <input
            type="radio"
            name="decorative"
            checked={decorative === ""}
            onChange={() => setDecorative("")}
          />{" "}
          Not specified
        </label>
        <label className="mr-3 text-xs">
          <input
            type="radio"
            name="decorative"
            checked={decorative === "meaningful"}
            onChange={() => setDecorative("meaningful")}
          />{" "}
          Meaningful
        </label>
        <label className="text-xs">
          <input
            type="radio"
            name="decorative"
            checked={decorative === "decorative"}
            onChange={() => setDecorative("decorative")}
          />{" "}
          Decorative
        </label>
      </fieldset>
      <label className="mt-2 flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={humanReviewed}
          onChange={(e) => setHumanReviewed(e.target.checked)}
        />
        I reviewed this alt text for this element
      </label>
      <WorkspaceAddToReportActions
        primaryLabel="Add alt review to accessibility report"
        disabled={!proposedAlt.trim()}
        disabledReason="Enter proposed alt text before saving."
        onPrimary={save}
        onSecondary={save}
      />
    </section>
  );
}
