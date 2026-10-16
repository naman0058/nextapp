"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type AccessibleDraftPreviewProps = {
  original: string;
  draft: string;
  changed: boolean;
  onApply?: (draft: string) => void;
};

export function AccessibleDraftPreview({
  original,
  draft,
  changed,
  onApply,
}: AccessibleDraftPreviewProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (!original.trim()) {
    return (
      <Card className="p-4 text-sm text-muted">
        Enter caption text to generate an accessibility-friendly draft.
      </Card>
    );
  }

  return (
    <Card className="space-y-4 p-4">
      <h3 className="text-sm font-semibold text-foreground">
        Accessibility-friendly draft
      </h3>
      <p className="text-xs text-muted">
        Deterministic suggestions only (no AI). Review before publishing.
      </p>
      <div>
        <p className="text-xs font-semibold text-muted">Original</p>
        <p className="mt-1 whitespace-pre-wrap text-sm">{original}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted">Suggested</p>
        <p className="mt-1 whitespace-pre-wrap text-sm">{draft}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {changed && onApply ? (
          <Button type="button" onClick={() => onApply(draft)}>
            Apply suggested draft
          </Button>
        ) : null}
        <Button type="button" variant="secondary" onClick={handleCopy}>
          {copied ? "Copied" : "Copy draft"}
        </Button>
      </div>
      {!changed ? (
        <p className="text-xs text-muted">No draft changes suggested.</p>
      ) : null}
    </Card>
  );
}
