"use client";

import { useState } from "react";
import type { AccessibilityCheckResult } from "@/features/accessibility/types/preflight";
import { FixPreview } from "@/features/accessibility/components/checker/FixPreview";
import { StatusLabel } from "@/features/accessibility/components/checker/StatusLabel";
import { Button } from "@/components/ui/Button";
import { preflightStatusAccent } from "@/components/results/resultStyles";
import { cn } from "@/lib/utils";

type CheckResultCardProps = {
  check: AccessibilityCheckResult;
  workingCaption: string;
  onApplyFix: (fixId: string, previewCaption: string) => void;
};

export function CheckResultCard({
  check,
  workingCaption,
  onApplyFix,
}: CheckResultCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <article
      className={cn(
        "rounded-2xl border border-border border-l-4 bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        preflightStatusAccent(check.status),
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-foreground">{check.title}</h3>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
            {check.category.replace("_", " ")}
          </p>
        </div>
        <StatusLabel status={check.status} />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-foreground">{check.summary}</p>
      {check.recommendation && (
        <p className="mt-3 rounded-xl bg-muted-bg px-3 py-2 text-sm text-muted">
          <span className="font-semibold text-foreground">Suggestion: </span>
          {check.recommendation}
        </p>
      )}
      {check.referenceLabel && (
        <p className="mt-2 text-xs text-muted">{check.referenceLabel}</p>
      )}
      {check.autoFix && check.status !== "pass" && (
        <div className="mt-4">
          {!previewOpen ? (
            <Button type="button" variant="secondary" onClick={() => setPreviewOpen(true)}>
              {check.autoFix.label}
            </Button>
          ) : (
            <FixPreview
              fix={check.autoFix}
              currentCaption={workingCaption}
              onApply={() => {
                onApplyFix(check.autoFix!.fixId, check.autoFix!.previewCaption);
                setPreviewOpen(false);
              }}
              onDismiss={() => setPreviewOpen(false)}
            />
          )}
        </div>
      )}
    </article>
  );
}
