import type { VideoVisualAccessibilityReview } from "@/features/video/types/visualReview";

const CATEGORIES = new Set([
  "on_screen_text",
  "important_action",
  "scene_context",
  "chart_or_graph",
  "instruction",
  "other",
]);

const COVERED = new Set(["yes", "partially", "no", "uncertain"]);
const PRIORITY = new Set(["low", "medium", "high"]);

export function validateVideoVisualReview(
  value: unknown,
): VideoVisualAccessibilityReview | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  if (!Array.isArray(obj.observations)) return null;
  if (typeof obj.overallHumanReviewRequired !== "boolean") return null;
  if (!Array.isArray(obj.limitations)) return null;

  const observations = [];
  for (const item of obj.observations) {
    if (!item || typeof item !== "object") return null;
    const o = item as Record<string, unknown>;
    if (typeof o.timestamp !== "number" || !Number.isFinite(o.timestamp)) {
      return null;
    }
    if (typeof o.description !== "string") return null;
    if (!CATEGORIES.has(String(o.category))) return null;
    if (!COVERED.has(String(o.likelyCoveredByAudio))) return null;
    if (!PRIORITY.has(String(o.priority))) return null;
    observations.push({
      timestamp: o.timestamp,
      category: o.category as VideoVisualAccessibilityReview["observations"][0]["category"],
      description: o.description.slice(0, 2000),
      likelyCoveredByAudio:
        o.likelyCoveredByAudio as VideoVisualAccessibilityReview["observations"][0]["likelyCoveredByAudio"],
      suggestedAudioDescription:
        o.suggestedAudioDescription == null
          ? null
          : String(o.suggestedAudioDescription).slice(0, 2000),
      priority: o.priority as VideoVisualAccessibilityReview["observations"][0]["priority"],
    });
  }

  return {
    observations,
    overallHumanReviewRequired: obj.overallHumanReviewRequired,
    limitations: obj.limitations
      .filter((x): x is string => typeof x === "string")
      .slice(0, 20),
  };
}
