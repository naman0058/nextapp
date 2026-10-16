import type { ScreenReaderPreviewInput } from "@/features/accessibility/types/screenReaderPreview";
import type { ScreenReaderPreviewResult } from "@/features/accessibility/types/screenReaderPreview";
import {
  hasFancyUnicode,
  normalizeFancyUnicode,
} from "@/features/accessibility/utils/helpers/textHelpers";
import { runPreflightAnalysis } from "@/features/accessibility/utils/runPreflightAnalysis";
import { analyzeCaptionAltDuplication } from "@/features/accessibility/utils/screenReaderPreview/analyzeCaptionAltDuplication";
import { analyzeHashtagPreview } from "@/features/accessibility/utils/screenReaderPreview/analyzeHashtagPreview";
import { analyzeVerbosity } from "@/features/accessibility/utils/screenReaderPreview/analyzeVerbosity";
import { buildAccessibleDraft } from "@/features/accessibility/utils/screenReaderPreview/buildAccessibleDraft";
import {
  buildContentOrderLabels,
  buildReadingOrderPreview,
} from "@/features/accessibility/utils/screenReaderPreview/buildReadingOrderPreview";
import { buildSpeechPreviewText } from "@/features/accessibility/utils/screenReaderPreview/buildSpeechPreviewText";
import { calculateExperienceSummary } from "@/features/accessibility/utils/screenReaderPreview/calculateExperienceSummary";
import { computeListeningFatigueMetrics } from "@/features/accessibility/utils/screenReaderPreview/computeListeningFatigueMetrics";
import { detectRepeatedEmojiSequences } from "@/features/accessibility/utils/screenReaderPreview/detectRepeatedEmojiSequences";
import { buildImagePurposeNote } from "@/features/accessibility/utils/screenReaderPreview/imagePurposeNote";

export function buildScreenReaderPreview(
  input: ScreenReaderPreviewInput,
): ScreenReaderPreviewResult {
  const caption = input.caption;
  const altText = input.altText;
  const hasImage = input.hasImage;

  const preflight = runPreflightAnalysis({
    platform: input.platform ?? "instagram",
    caption,
    hasImage,
    altText,
  });

  const readingOrder = buildReadingOrderPreview({
    caption,
    altText,
    hasImage,
    linkLabel: input.linkLabel,
  });

  const noiseFindings = analyzeVerbosity(
    caption,
    altText,
    hasImage,
    preflight.checks,
  );

  const experienceSummary = calculateExperienceSummary(
    preflight.checks,
    noiseFindings,
  );

  const { draft, changed } = buildAccessibleDraft(caption);
  const speechText = buildSpeechPreviewText({
    caption,
    altText,
    hasImage,
    linkLabel: input.linkLabel,
  });

  const fancy =
    hasFancyUnicode(caption) ? normalizeFancyUnicode(caption) : null;

  const altTextSource =
    input.altTextSource ??
    (altText.trim() ? "user" : "none");

  const preflightReviewCount = preflight.checks.filter(
    (c) => c.status === "review" || c.status === "fail",
  ).length;

  return {
    readingOrder,
    contentOrderLabels: buildContentOrderLabels(readingOrder),
    noiseFindings,
    experienceSummary,
    speechText,
    accessibleDraft: draft,
    draftChanged: changed,
    metrics: computeListeningFatigueMetrics(caption),
    emojiSequences: detectRepeatedEmojiSequences(caption),
    hashtagItems: analyzeHashtagPreview(caption),
    fancyUnicodeOriginal: fancy ? caption : null,
    fancyUnicodeNormalized: fancy?.normalized ?? null,
    duplication: hasImage
      ? analyzeCaptionAltDuplication(caption, altText)
      : null,
    imagePurposeNote: hasImage
      ? buildImagePurposeNote(input.imagePurpose)
      : null,
    altTextSource,
    preflightReviewCount,
  };
}
