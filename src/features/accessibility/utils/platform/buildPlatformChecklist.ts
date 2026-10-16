import { CHECK_IDS } from "@/features/accessibility/constants/checkIds";
import { getPlatformAccessibilityConfig } from "@/features/accessibility/config/platformAccessibility";
import type {
  PlatformChecklistItemStatus,
  PlatformChecklistResultItem,
  PlatformPublishingReadiness,
  PlatformPublishingReadinessLevel,
} from "@/features/accessibility/config/platformAccessibility/types";
import type { PlatformChecklistInput } from "@/features/accessibility/utils/platform/types";
import type { PreflightAnalysisResult } from "@/features/accessibility/types/preflight";

function checkStatus(
  results: PreflightAnalysisResult | null,
  id: string,
): "pass" | "review" | "fail" | "not_checked" | null {
  if (!results) return null;
  const c = results.checks.find((x) => x.id === id);
  return c?.status ?? null;
}

function fromPhase1(
  results: PreflightAnalysisResult | null,
  passIds: string[],
  failIds: string[],
): PlatformChecklistItemStatus {
  if (!results) return "not_checked";
  for (const id of failIds) {
    const s = checkStatus(results, id);
    if (s === "fail" || s === "review") return "review";
  }
  for (const id of passIds) {
    const s = checkStatus(results, id);
    if (s === "pass") return "ready";
    if (s === "review" || s === "fail") return "review";
  }
  return "ready";
}

function resolveItem(
  templateId: string,
  input: PlatformChecklistInput,
): { status: PlatformChecklistItemStatus; detail?: string } {
  const { platform, hasImage, altText, phase1, phase3 } = input;
  const config = getPlatformAccessibilityConfig(platform);
  const alt = altText.trim();
  const limit = config?.imageDescriptionLimit ?? null;

  if (templateId === "video-captions") {
    if (typeof globalThis.sessionStorage !== "undefined") {
      try {
        const raw = globalThis.sessionStorage.getItem("acps-video-preflight-v1");
        if (raw) {
          const parsed = JSON.parse(raw) as { cues?: unknown[] };
          if (Array.isArray(parsed.cues) && parsed.cues.length > 0) {
            return {
              status: "review",
              detail:
                "Video captions prepared in Video Accessibility Checker — confirm accuracy before publishing.",
            };
          }
        }
      } catch {
        /* ignore */
      }
    }
    return {
      status: "not_applicable",
      detail:
        "Use the Video Accessibility Checker (/video-accessibility-checker) for video captions.",
    };
  }

  if (
    templateId === "platform-alt-added" ||
    templateId === "platform-final-review" ||
    templateId === "all-images-reviewed"
  ) {
    if (input.userPublishingConfirmations[templateId]) {
      return { status: "ready", detail: "Confirmed by you in this session." };
    }
    return {
      status: "review",
      detail: "User confirmation required — this tool cannot verify platform publishing.",
    };
  }

  if (!hasImage) {
    if (
      templateId === "alt-text-prepared" ||
      templateId === "image-text-covered" ||
      templateId === "caption-alt-duplication" ||
      templateId === "visual-contrast" ||
      templateId === "x-alt-limit" ||
      templateId === "all-images-reviewed"
    ) {
      return { status: "not_applicable" };
    }
  }

  switch (templateId) {
    case "alt-text-prepared":
      if (!alt) {
        return {
          status: "review",
          detail: "Image description requires review before publishing.",
        };
      }
      return { status: "ready" };

    case "x-alt-limit":
      if (limit !== null && alt.length > limit) {
        return {
          status: "review",
          detail: `X currently documents a ${limit.toLocaleString("en-US")}-character limit for image descriptions.`,
        };
      }
      return alt ? { status: "ready" } : { status: "not_checked" };

    case "image-text-covered":
      if (!phase1) return { status: "not_checked" };
      if (
        checkStatus(phase1, CHECK_IDS.FANCY_UNICODE) === "review" ||
        checkStatus(phase1, CHECK_IDS.LONG_UNBROKEN_TEXT) === "review"
      ) {
        return {
          status: "review",
          detail: "Review text embedded in graphics and long unbroken content.",
        };
      }
      if (input.phase2?.hasAnalysis) {
        return { status: "ready", detail: "AI image review available — verify visible text coverage." };
      }
      return { status: "not_checked", detail: "Run optional AI image review or verify manually." };

    case "caption-alt-duplication":
      return {
        status: fromPhase1(phase1, [], [CHECK_IDS.DUPLICATE_CAPTION_ALT]),
      };

    case "hashtag-readability":
      return {
        status: fromPhase1(phase1, [], [
          CHECK_IDS.HASHTAG_READABILITY,
          CHECK_IDS.HASHTAG_OVERLOAD,
        ]),
      };

    case "emoji-reviewed":
      return {
        status: fromPhase1(phase1, [], [
          CHECK_IDS.CONSECUTIVE_EMOJI,
          CHECK_IDS.EMOJI_HEAVY_START,
        ]),
      };

    case "fancy-unicode":
      return {
        status: fromPhase1(phase1, [], [CHECK_IDS.FANCY_UNICODE]),
      };

    case "caption-context":
    case "offer-details":
      if (!input.caption.trim()) {
        return { status: "review", detail: "Caption is empty." };
      }
      return {
        status: fromPhase1(phase1, [CHECK_IDS.EMPTY_CAPTION], [
          CHECK_IDS.EXCESSIVE_CAPS,
          CHECK_IDS.LONG_UNBROKEN_TEXT,
        ]),
      };

    case "visual-contrast":
      if (!phase3.measured) {
        return { status: "not_checked", detail: "Measure contrast in Visual Accessibility." };
      }
      if (phase3.primaryVerdict === "fail") {
        return { status: "review", detail: "Measured contrast did not meet selected threshold." };
      }
      return { status: "ready" };

    case "link-wording":
      return {
        status: fromPhase1(phase1, [], [
          CHECK_IDS.GENERIC_LINK_LANGUAGE,
          CHECK_IDS.LONG_WORD_OR_URL,
        ]),
      };

    default:
      return { status: "not_checked" };
  }
}

export function buildPlatformChecklist(
  input: PlatformChecklistInput,
): PlatformChecklistResultItem[] {
  const config = getPlatformAccessibilityConfig(input.platform);
  if (!config) return [];

  return config.checklist.map((template) => {
    const resolved = resolveItem(template.id, input);
    return {
      id: template.id,
      label: template.label,
      kind: template.kind,
      status: resolved.status,
      detail: resolved.detail,
    };
  });
}

export function summarizePlatformReadiness(
  items: PlatformChecklistResultItem[],
): PlatformPublishingReadiness {
  let readyCount = 0;
  let reviewCount = 0;
  let notCheckedCount = 0;
  let notApplicableCount = 0;

  for (const item of items) {
    if (item.status === "ready") readyCount++;
    if (item.status === "review") reviewCount++;
    if (item.status === "not_checked") notCheckedCount++;
    if (item.status === "not_applicable") notApplicableCount++;
  }

  const totalApplicable = items.filter(
    (i) => i.status !== "not_applicable",
  ).length;

  let level: PlatformPublishingReadinessLevel = "ready_for_final_review";
  let label = "Ready for final platform review";

  if (reviewCount >= 3 || (reviewCount >= 1 && notCheckedCount >= 2)) {
    level = "important_items_need_attention";
    label = "Important items still need attention";
  } else if (reviewCount >= 1 || notCheckedCount >= 2) {
    level = "few_items_need_review";
    label = "A few items need review";
  }

  return {
    level,
    label,
    readyCount,
    reviewCount,
    notCheckedCount,
    notApplicableCount,
    totalApplicable,
  };
}
