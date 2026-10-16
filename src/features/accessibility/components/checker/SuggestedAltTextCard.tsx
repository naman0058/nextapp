"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type SuggestedAltTextCardProps = {
  suggestedAltText: string;
  rationale: string;
  onUseAsAltText: () => void;
};

export function SuggestedAltTextCard({
  suggestedAltText,
  rationale,
  onUseAsAltText,
}: SuggestedAltTextCardProps) {
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(suggestedAltText);
      setCopyMessage("Suggested alt text copied.");
      setTimeout(() => setCopyMessage(null), 3000);
    } catch {
      setCopyMessage("Could not copy. Select the text manually.");
    }
  }

  return (
    <Card className="p-4">
      <h3 className="text-base font-semibold text-foreground">
        AI suggested alt text
      </h3>
      <p className="mt-2 text-sm text-foreground">{suggestedAltText}</p>
      <p className="mt-2 text-xs text-muted">{rationale}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="primary" onClick={onUseAsAltText}>
          Use as alt text
        </Button>
        <Button type="button" variant="secondary" onClick={handleCopy}>
          Copy
        </Button>
      </div>
      <p className="mt-2 text-sm" role="status" aria-live="polite">
        {copyMessage ?? ""}
      </p>
    </Card>
  );
}
