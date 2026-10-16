"use client";

import { useEffect, useMemo, useState } from "react";
import type { AIImageAccessibilityAnalysis } from "@/features/accessibility/types/aiImageAnalysis";
import type { AltTextSource } from "@/features/accessibility/types/screenReaderPreview";
import { AccessibleDraftPreview } from "@/features/accessibility/components/screenReader/AccessibleDraftPreview";
import { AssistiveExperienceSummary } from "@/features/accessibility/components/screenReader/AssistiveExperienceSummary";
import { ImageDescriptionPreview } from "@/features/accessibility/components/screenReader/ImageDescriptionPreview";
import { NoiseSummary } from "@/features/accessibility/components/screenReader/NoiseSummary";
import { PreviewDisclaimer } from "@/features/accessibility/components/screenReader/PreviewDisclaimer";
import { ReadingOrderPreview } from "@/features/accessibility/components/screenReader/ReadingOrderPreview";
import { ScreenReaderPrivacyNote } from "@/features/accessibility/components/screenReader/ScreenReaderPrivacyNote";
import { SpeechPreviewControls } from "@/features/accessibility/components/screenReader/SpeechPreviewControls";
import { buildScreenReaderPreview } from "@/features/accessibility/utils/screenReaderPreview";
import type { SocialPlatform } from "@/types";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/results/SegmentedControl";
import { cn } from "@/lib/utils";

type PreviewMode = "reading" | "noise" | "listen" | "draft";

export type ScreenReaderExperiencePanelProps = {
  mode?: "embedded" | "standalone";
  caption: string;
  altText: string;
  hasImage: boolean;
  platform?: SocialPlatform;
  linkLabel?: string;
  altTextSource?: AltTextSource;
  aiAnalysis?: AIImageAccessibilityAnalysis | null;
  onApplyDraft?: (draft: string) => void;
  onEngaged?: () => void;
};

const MODES: { id: PreviewMode; label: string }[] = [
  { id: "reading", label: "Reading order" },
  { id: "noise", label: "Noise / verbosity" },
  { id: "listen", label: "Listen" },
  { id: "draft", label: "Cleaned draft" },
];

export function ScreenReaderExperiencePanel({
  mode = "embedded",
  caption,
  altText,
  hasImage,
  platform,
  linkLabel,
  altTextSource = "none",
  aiAnalysis = null,
  onApplyDraft,
  onEngaged,
}: ScreenReaderExperiencePanelProps) {
  const [activeMode, setActiveMode] = useState<PreviewMode>("reading");

  useEffect(() => {
    if (mode === "embedded") {
      onEngaged?.();
    }
  }, [mode, onEngaged]);
  const [speechKey, setSpeechKey] = useState(0);

  const preview = useMemo(
    () =>
      buildScreenReaderPreview({
        caption,
        altText,
        hasImage,
        platform,
        linkLabel,
        altTextSource: altText.trim()
          ? altTextSource === "none"
            ? "user"
            : altTextSource
          : "none",
        imagePurpose: aiAnalysis?.imagePurpose ?? null,
      }),
    [
      caption,
      altText,
      hasImage,
      platform,
      linkLabel,
      altTextSource,
      aiAnalysis?.imagePurpose,
    ],
  );

  function handleResetPreview() {
    setSpeechKey((k) => k + 1);
    setActiveMode("reading");
  }

  return (
    <div className="space-y-6">
      {mode === "standalone" ? <ScreenReaderPrivacyNote /> : null}
      <PreviewDisclaimer />

      {platform ? (
        <p className="text-xs text-muted">
          Platform context: {platform} (preview logic is not platform-specific
          yet).
        </p>
      ) : null}

      <AssistiveExperienceSummary
        summary={preview.experienceSummary}
        metrics={preview.metrics}
      />

      <SegmentedControl
        ariaLabel="Preview modes"
        options={MODES}
        value={activeMode}
        onChange={setActiveMode}
      />

      <div
        role="tabpanel"
        className={cn(
          "rounded-3xl border border-border bg-slate-50/40 p-4 sm:p-5",
          activeMode !== "reading" && "hidden",
        )}
        hidden={activeMode !== "reading"}
      >
        <ReadingOrderPreview
          items={preview.readingOrder}
          contentOrderLabels={preview.contentOrderLabels}
        />
      </div>

      <div
        role="tabpanel"
        className={cn(
          "rounded-3xl border border-border bg-slate-50/40 p-4 sm:p-5",
          activeMode !== "noise" && "hidden",
        )}
        hidden={activeMode !== "noise"}
      >
        <NoiseSummary
          findings={preview.noiseFindings}
          emojiSequences={preview.emojiSequences}
        />
        <div className="mt-4 space-y-2 text-sm">
          <p className="font-semibold text-foreground">Why this matters</p>
          <ul className="list-disc pl-5 text-muted">
            <li>Repeated emojis may add listening time.</li>
            <li>Descriptive links help when content is read linearly.</li>
            <li>Fancy Unicode may not read consistently.</li>
            <li>Concise, non-duplicative alt text reduces repetition.</li>
          </ul>
        </div>
      </div>

      {activeMode === "listen" ? (
        <div
          role="tabpanel"
          className="rounded-3xl border border-border bg-slate-50/40 p-4 sm:p-5"
        >
          <SpeechPreviewControls
            key={speechKey}
            speechText={preview.speechText}
            onResetSpeech={() => setSpeechKey((k) => k + 1)}
          />
        </div>
      ) : null}

      <div
        role="tabpanel"
        className={cn(
          "rounded-3xl border border-border bg-slate-50/40 p-4 sm:p-5",
          activeMode !== "draft" && "hidden",
        )}
        hidden={activeMode !== "draft"}
      >
        <AccessibleDraftPreview
          original={caption}
          draft={preview.accessibleDraft}
          changed={preview.draftChanged}
          onApply={onApplyDraft}
        />
      </div>

      <ImageDescriptionPreview
        hasImage={hasImage}
        altText={altText}
        altTextSource={
          altText.trim()
            ? altTextSource === "none"
              ? "user"
              : altTextSource
            : "none"
        }
        imagePurposeNote={preview.imagePurposeNote}
      />

      <Button type="button" variant="secondary" onClick={handleResetPreview}>
        Reset preview
      </Button>
    </div>
  );
}
