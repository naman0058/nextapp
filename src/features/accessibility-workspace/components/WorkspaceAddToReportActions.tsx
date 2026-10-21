"use client";

import Link from "next/link";
import { useState } from "react";
import { WORKSPACE_TOOL_CATALOG } from "@/features/accessibility-workspace/toolCatalog";
import { StatusMessage } from "@/components/ui/StatusMessage";

type Props = {
  returnHref?: string;
  returnLabel?: string;
  primaryLabel: string;
  secondaryLabel?: string;
  disabled?: boolean;
  disabledReason?: string;
  onPrimary: (includedInReport: boolean) => void;
  onSecondary?: (includedInReport: false) => void;
};

export function WorkspaceAddToReportActions({
  returnHref = WORKSPACE_TOOL_CATALOG.website_scanner.path,
  returnLabel = "Back to website finding",
  primaryLabel,
  secondaryLabel = "Save without including in report",
  disabled,
  disabledReason,
  onPrimary,
  onSecondary,
}: Props) {
  const [message, setMessage] = useState<string | null>(null);

  function run(included: boolean) {
    if (disabled) return;
    if (included) onPrimary(true);
    else if (onSecondary) onSecondary(false);
    else onPrimary(false);
    setMessage(
      included
        ? "Added to your website scan workspace report list. Open the Website Scanner Report tab to manage inclusion."
        : "Saved in this browser session without marking for report export.",
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        <Link
          href={returnHref}
          className="rounded border border-border bg-background px-3 py-1.5 text-xs font-medium underline"
        >
          {returnLabel}
        </Link>
        <button
          type="button"
          disabled={disabled}
          className="rounded border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
          onClick={() => run(true)}
        >
          {primaryLabel}
        </button>
        <button
          type="button"
          disabled={disabled}
          className="rounded border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
          onClick={() => run(false)}
        >
          {secondaryLabel}
        </button>
      </div>
      {disabled && disabledReason ? (
        <p className="text-xs text-muted">{disabledReason}</p>
      ) : null}
      {message ? (
        <div role="status" aria-live="polite">
          <StatusMessage variant="review" title={message} />
        </div>
      ) : null}
    </div>
  );
}
