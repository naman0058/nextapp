import type {
  PreflightAnalysisResult,
  PreflightInput,
} from "@/features/accessibility/types/preflight";
import {
  checkAltTextFilename,
  checkAltTextLength,
  checkAltTextPrefix,
  checkAltTextPresence,
  checkDuplicateCaptionAlt,
} from "@/features/accessibility/utils/checks/altTextChecks";
import {
  checkEmptyCaption,
  checkExcessiveCaps,
} from "@/features/accessibility/utils/checks/captionChecks";
import {
  checkConsecutiveEmoji,
  checkEmojiHeavyStart,
} from "@/features/accessibility/utils/checks/emojiChecks";
import {
  checkHashtagOverload,
  checkHashtagReadability,
} from "@/features/accessibility/utils/checks/hashtagChecks";
import { checkGenericLinkLanguage } from "@/features/accessibility/utils/checks/linkChecks";
import {
  checkLongUnbrokenText,
  checkLongWordOrUrl,
  checkRepeatedPunctuation,
} from "@/features/accessibility/utils/checks/readabilityChecks";
import { checkFancyUnicode } from "@/features/accessibility/utils/checks/unicodeChecks";
import {
  computeReadinessScore,
  countResults,
} from "@/features/accessibility/utils/computeReadinessScore";

export function runPreflightAnalysis(
  input: PreflightInput,
): PreflightAnalysisResult {
  const caption = input.caption;

  const checks = [
    checkEmptyCaption(caption),
    checkExcessiveCaps(caption),
    checkConsecutiveEmoji(caption),
    checkEmojiHeavyStart(caption),
    checkFancyUnicode(caption),
    checkHashtagReadability(caption),
    checkHashtagOverload(caption),
    checkRepeatedPunctuation(caption),
    checkLongUnbrokenText(caption),
    checkGenericLinkLanguage(caption),
    checkLongWordOrUrl(caption),
    checkAltTextPresence(input.hasImage, input.altText),
    checkAltTextPrefix(input.hasImage, input.altText),
    checkAltTextLength(input.hasImage, input.altText),
    checkAltTextFilename(input.hasImage, input.altText),
    checkDuplicateCaptionAlt(input.hasImage, caption, input.altText),
  ];

  const counts = countResults(checks);
  const { score, scoreBandLabel } = computeReadinessScore(checks);

  return {
    checks,
    score,
    scoreBandLabel,
    counts,
  };
}
