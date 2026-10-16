"use client";

import { useMemo, useState } from "react";
import {
  loadPublishingConfirmations,
  upsertPublishingConfirmation,
} from "@/features/accessibility/utils/publishingConfirmationsSession";
import { getPlatformAccessibilityConfig } from "@/features/accessibility/config/platformAccessibility";
import { BeforeYouPublishSection } from "@/features/accessibility/components/platform/BeforeYouPublishSection";
import { CopyPublishingActions } from "@/features/accessibility/components/platform/CopyPublishingActions";
import { PlatformGuidanceAccordion } from "@/features/accessibility/components/platform/PlatformGuidanceAccordion";
import { PlatformHeader } from "@/features/accessibility/components/platform/PlatformHeader";
import { PlatformPublishingReadinessPanel } from "@/features/accessibility/components/platform/PlatformPublishingReadiness";
import { ReadyToPublishPanel } from "@/features/accessibility/components/platform/ReadyToPublishPanel";
import { XAltTextCharacterCounter } from "@/features/accessibility/components/platform/XAltTextCharacterCounter";
import type { AiStatus } from "@/features/accessibility/components/checker/checkerReducer";
import type { ExperienceSummaryLevel } from "@/features/accessibility/types/screenReaderPreview";
import type { PreflightAnalysisResult } from "@/features/accessibility/types/preflight";
import type { ContrastSnapshot } from "@/features/accessibility/utils/platform/types";
import {
  buildPlatformChecklist,
  summarizePlatformReadiness,
} from "@/features/accessibility/utils/platform";
import type { SocialPlatform } from "@/types";

type PlatformPublishingSectionProps = {
  platform: SocialPlatform;
  caption: string;
  altText: string;
  hasImage: boolean;
  phase1: PreflightAnalysisResult | null;
  aiStatus: AiStatus;
  hasAiAnalysis: boolean;
  contrastSnapshot: ContrastSnapshot;
  experienceLevel?: ExperienceSummaryLevel;
  showPlatformHeader?: boolean;
};

export function PlatformPublishingSection({
  platform,
  caption,
  altText,
  hasImage,
  phase1,
  aiStatus,
  hasAiAnalysis,
  contrastSnapshot,
  experienceLevel,
  showPlatformHeader = true,
}: PlatformPublishingSectionProps) {
  const config = getPlatformAccessibilityConfig(platform);
  const [confirmationRevision, setConfirmationRevision] = useState(0);

  const confirmations = useMemo(
    () => loadPublishingConfirmations(platform),
    // confirmationRevision re-reads session after checkbox toggles
    // eslint-disable-next-line react-hooks/exhaustive-deps -- session sync tick
    [platform, confirmationRevision],
  );

  const publishingConfirmations = useMemo(
    () => ({
      "platform-alt-added": Boolean(confirmations["confirm-alt-on-platform"]),
      "platform-final-review": Boolean(confirmations["confirm-final-review"]),
      "all-images-reviewed": Boolean(confirmations["confirm-alt-on-platform"]),
    }),
    [confirmations],
  );

  const checklistInput = useMemo(
    () => ({
      platform,
      caption,
      altText,
      hasImage,
      phase1,
      phase2: { aiStatus, hasAnalysis: hasAiAnalysis },
      phase3: contrastSnapshot,
      phase4: experienceLevel ? { experienceLevel } : null,
      userPublishingConfirmations: publishingConfirmations,
    }),
    [
      platform,
      caption,
      altText,
      hasImage,
      phase1,
      aiStatus,
      hasAiAnalysis,
      contrastSnapshot,
      experienceLevel,
      publishingConfirmations,
    ],
  );

  const items = useMemo(
    () => buildPlatformChecklist(checklistInput),
    [checklistInput],
  );
  const summary = useMemo(() => summarizePlatformReadiness(items), [items]);

  if (!config) return null;

  const publishingNotes = items
    .filter((i) => i.status === "review" && i.kind === "publishing_task")
    .map((i) => i.label);

  return (
    <section
      id="platform-publishing"
      aria-labelledby="platform-publishing-heading"
      className="space-y-6"
    >
      <h2 id="platform-publishing-heading" className="sr-only">
        Platform publishing
      </h2>
      {showPlatformHeader ? <PlatformHeader config={config} /> : null}

      {platform === "x" && altText.trim() && config.imageDescriptionLimit ? (
        <XAltTextCharacterCounter
          altText={altText}
          limit={config.imageDescriptionLimit}
        />
      ) : null}

      <PlatformPublishingReadinessPanel summary={summary} items={items} />
      <PlatformGuidanceAccordion config={config} />
      <BeforeYouPublishSection
        confirmations={confirmations}
        onToggle={(id, checked) => {
          upsertPublishingConfirmation(platform, id, checked);
          setConfirmationRevision((r) => r + 1);
        }}
      />
      <ReadyToPublishPanel summary={summary} platformName={config.name} />
      <CopyPublishingActions
        platform={platform}
        caption={caption}
        altText={altText}
        publishingNotes={publishingNotes}
      />
    </section>
  );
}
