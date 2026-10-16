"use client";

import { useMemo, useState } from "react";
import type { ContrastTextType, RGBColor } from "@/features/accessibility/types/visualAccessibility";
import { formatContrastRatio } from "@/features/accessibility/utils/contrast/contrastRatio";
import { getRequiredRatio } from "@/features/accessibility/utils/contrast/evaluateContrast";
import {
  suggestAccessibleBackground,
  suggestAccessibleForeground,
} from "@/features/accessibility/utils/contrast/suggestAccessibleColor";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type AccessibleColorSuggestionProps = {
  foreground: RGBColor;
  background: RGBColor;
  textType: ContrastTextType;
  evaluationFails: boolean;
};

export function AccessibleColorSuggestion({
  foreground,
  background,
  textType,
  evaluationFails,
}: AccessibleColorSuggestionProps) {
  const [target, setTarget] = useState<"foreground" | "background">("foreground");
  const [copied, setCopied] = useState(false);
  const required = getRequiredRatio(textType);

  const suggestion = useMemo(() => {
    if (!evaluationFails) return null;
    if (target === "foreground") {
      return suggestAccessibleForeground(foreground, background, required);
    }
    return suggestAccessibleBackground(foreground, background, required);
  }, [evaluationFails, target, foreground, background, required]);

  if (!evaluationFails) {
    return null;
  }

  async function handleCopy(hex: string) {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card className="space-y-3 p-4">
      <h4 className="text-sm font-semibold text-foreground">
        Accessible color suggestion
      </h4>
      <p className="text-xs text-muted">
        Suggestions move colors toward black or white for contrast only. Verify
        against your brand palette before publishing.
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={target === "foreground" ? "primary" : "secondary"}
          onClick={() => setTarget("foreground")}
        >
          Adjust text
        </Button>
        <Button
          type="button"
          variant={target === "background" ? "primary" : "secondary"}
          onClick={() => setTarget("background")}
        >
          Adjust background
        </Button>
      </div>
      {suggestion ? (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span
            className="inline-block h-10 w-10 rounded border border-border"
            style={{ backgroundColor: suggestion.suggestedHex }}
            aria-hidden
          />
          <div>
            <p>Suggested: {suggestion.suggestedHex}</p>
            <p className="text-muted">
              Estimated ratio: {formatContrastRatio(suggestion.ratio)}
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => handleCopy(suggestion.suggestedHex)}>
            {copied ? "Copied" : "Copy HEX"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted">
          No simple adjustment found in this range. Try manual colors or
          redesign text placement.
        </p>
      )}
    </Card>
  );
}
