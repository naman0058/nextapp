import {
  EXPERIENCE_LABELS,
  EXPERIENCE_MOSTLY_CLEAR_MAX,
  EXPERIENCE_REVIEW_FINDING_THRESHOLD,
  HIGH_VERBOSITY_SIGNALS,
} from "@/features/accessibility/constants/screenReaderPreview";
import { CHECK_IDS } from "@/features/accessibility/constants/checkIds";
import type { AccessibilityCheckResult } from "@/features/accessibility/types/preflight";
import type {
  ExperienceSummary,
  NoiseFinding,
} from "@/features/accessibility/types/screenReaderPreview";

function checkStatus(
  checks: AccessibilityCheckResult[],
  id: string,
): boolean {
  const c = checks.find((x) => x.id === id);
  return c?.status === "review" || c?.status === "fail";
}

export function calculateExperienceSummary(
  preflightChecks: AccessibilityCheckResult[],
  noiseFindings: NoiseFinding[],
): ExperienceSummary {
  const reviewChecks = preflightChecks.filter(
    (c) => c.status === "review" || c.status === "fail",
  );
  const preflightReviewCount = reviewChecks.length;

  const repeatedEmojis = checkStatus(
    preflightChecks,
    CHECK_IDS.CONSECUTIVE_EMOJI,
  );
  const fancyUnicode = checkStatus(preflightChecks, CHECK_IDS.FANCY_UNICODE);
  const excessHashtags = checkStatus(
    preflightChecks,
    CHECK_IDS.HASHTAG_OVERLOAD,
  );
  const duplicateCaptionAlt =
    checkStatus(preflightChecks, CHECK_IDS.DUPLICATE_CAPTION_ALT) ||
    noiseFindings.some((n) => n.id === "caption-alt-similar");
  const genericLinkLanguage = checkStatus(
    preflightChecks,
    CHECK_IDS.GENERIC_LINK_LANGUAGE,
  );

  const highVerbositySignals = reviewChecks.filter((c) =>
    (HIGH_VERBOSITY_SIGNALS as readonly string[]).includes(c.id),
  ).length;

  let level: ExperienceSummary["level"] = "clear";

  if (
    highVerbositySignals >= 3 ||
    preflightReviewCount >= EXPERIENCE_REVIEW_FINDING_THRESHOLD + 1 ||
    (repeatedEmojis && excessHashtags) ||
    (fancyUnicode && repeatedEmojis)
  ) {
    level = "high_verbosity";
  } else if (preflightReviewCount >= EXPERIENCE_REVIEW_FINDING_THRESHOLD) {
    level = "review";
  } else if (
    preflightReviewCount >= 1 &&
    preflightReviewCount <= EXPERIENCE_MOSTLY_CLEAR_MAX
  ) {
    level = "mostly_clear";
  } else if (preflightReviewCount === 0 && noiseFindings.length === 0) {
    level = "clear";
  } else if (noiseFindings.length > 0 && preflightReviewCount === 0) {
    level = "mostly_clear";
  }

  return {
    level,
    label: EXPERIENCE_LABELS[level],
    noiseSourceCount: noiseFindings.length,
    repeatedEmojis,
    fancyUnicode,
    excessHashtags,
    duplicateCaptionAlt,
    genericLinkLanguage,
  };
}
