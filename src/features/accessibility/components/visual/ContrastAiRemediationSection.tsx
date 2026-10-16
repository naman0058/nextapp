"use client";

import { useMemo, useState } from "react";
import type {
  ContrastEvaluation,
  ContrastTextType,
  RGBColor,
} from "@/features/accessibility/types/visualAccessibility";
import { buildContrastRemediationContext } from "@/lib/ai/remediation/adapters/buildContrastRemediationContext";
import { AIRemediationPanel } from "@/lib/ai/remediation/components/AIRemediationPanel";
import type { AiRemediationEntry } from "@/lib/ai/remediation/client/aiRemediationEntry";
import { useAiRemediationSession } from "@/lib/ai/remediation/client/useAiRemediationSession";

type Props = {
  foreground: RGBColor;
  background: RGBColor;
  foregroundHex: string;
  backgroundHex: string;
  textType: ContrastTextType;
  evaluation: ContrastEvaluation;
  entry?: AiRemediationEntry | null;
  onEntry?: (entry: AiRemediationEntry) => void;
};

export function ContrastAiRemediationSection({
  foreground,
  background,
  foregroundHex,
  backgroundHex,
  textType,
  evaluation,
  entry: controlledEntry,
  onEntry,
}: Props) {
  const { sessionId, ready } = useAiRemediationSession();
  const [entry, setEntry] = useState<AiRemediationEntry | null>(
    controlledEntry ?? null,
  );
  const [contentKey, setContentKey] = useState("");
  const activeEntry = controlledEntry ?? entry;

  const context = useMemo(
    () =>
      buildContrastRemediationContext({
        foreground,
        background,
        foregroundHex,
        backgroundHex,
        textType,
        evaluation,
      }),
    [foreground, background, foregroundHex, backgroundHex, textType, evaluation],
  );

  const scanId = String(context.facts.issueFingerprint ?? "contrast");
  const key = `${foregroundHex}-${backgroundHex}-${textType}-${evaluation.ratio}`;
  const stale = Boolean(activeEntry && contentKey !== key && contentKey !== "");

  return (
    <>
      <div className="rounded border border-border bg-muted/30 p-2 text-xs">
        <span className="font-semibold">Measured</span> — ratio{" "}
        {evaluation.displayRatio} ({evaluation.primaryLabel}). Deterministic values
        override any conflicting AI text.
      </div>
      <AIRemediationPanel
        panelId="contrast"
        source="contrast"
        sessionId={sessionId}
        sessionReady={ready}
        scanId={scanId}
        entry={
          activeEntry ? { ...activeEntry, stale: stale || activeEntry.stale } : null
        }
        stale={stale}
        className="mt-4 border-t border-border pt-4"
        buildRequest={() => ({
          facts: context.facts,
          deterministicGuidance: context.deterministicGuidance,
        })}
        onEntry={(newEntry) => {
          setContentKey(key);
          setEntry(newEntry);
          onEntry?.(newEntry);
        }}
        skipGenerateIfCached={(e) => !e.stale && contentKey === key}
      />
    </>
  );
}
