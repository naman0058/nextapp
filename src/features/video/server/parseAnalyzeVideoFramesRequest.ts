import { getMaxVisualReviewFrames } from "@/features/video/constants/visualReviewLimits";
import type { SocialPlatform } from "@/types";

const PLATFORMS = new Set<SocialPlatform>([
  "instagram",
  "facebook",
  "linkedin",
  "x",
  "tiktok",
  "youtube",
]);

export type AnalyzeVideoFramesRequestBody = {
  frames: { base64: string; mimeType: string; timestampSeconds: number }[];
  platform?: SocialPlatform;
  transcriptExcerpt: string;
  captionSummary: string;
};

export type ParseFramesResult =
  | { ok: true; body: AnalyzeVideoFramesRequestBody }
  | { ok: false; status: number; message: string };

const MAX_FRAME_BASE64 = 1_500_000;

export function parseAnalyzeVideoFramesRequest(
  body: unknown,
): ParseFramesResult {
  if (!body || typeof body !== "object") {
    return { ok: false, status: 400, message: "Invalid request body." };
  }

  const framesRaw = (body as { frames?: unknown }).frames;
  if (!Array.isArray(framesRaw) || framesRaw.length === 0) {
    return { ok: false, status: 400, message: "At least one frame is required." };
  }
  if (framesRaw.length > getMaxVisualReviewFrames()) {
    return { ok: false, status: 400, message: "Too many frames." };
  }

  const frames: AnalyzeVideoFramesRequestBody["frames"] = [];
  for (const item of framesRaw) {
    if (!item || typeof item !== "object") {
      return { ok: false, status: 400, message: "Invalid frame payload." };
    }
    const base64 =
      "base64" in item && typeof (item as { base64: unknown }).base64 === "string"
        ? (item as { base64: string }).base64
        : "";
    const mimeType =
      "mimeType" in item &&
      typeof (item as { mimeType: unknown }).mimeType === "string"
        ? (item as { mimeType: string }).mimeType
        : "image/jpeg";
    const timestampSeconds =
      "timestampSeconds" in item &&
      typeof (item as { timestampSeconds: unknown }).timestampSeconds === "number"
        ? (item as { timestampSeconds: number }).timestampSeconds
        : NaN;
    if (!base64 || base64.length > MAX_FRAME_BASE64) {
      return { ok: false, status: 400, message: "Invalid frame data." };
    }
    if (!Number.isFinite(timestampSeconds)) {
      return { ok: false, status: 400, message: "Invalid frame timestamp." };
    }
    if (!mimeType.startsWith("image/")) {
      return { ok: false, status: 400, message: "Invalid frame type." };
    }
    frames.push({ base64, mimeType, timestampSeconds });
  }

  const transcriptExcerpt =
    "transcriptExcerpt" in body &&
    typeof (body as { transcriptExcerpt: unknown }).transcriptExcerpt === "string"
      ? (body as { transcriptExcerpt: string }).transcriptExcerpt.slice(0, 8000)
      : "";

  const captionSummary =
    "captionSummary" in body &&
    typeof (body as { captionSummary: unknown }).captionSummary === "string"
      ? (body as { captionSummary: string }).captionSummary.slice(0, 4000)
      : "";

  let platform: SocialPlatform | undefined;
  if (
    "platform" in body &&
    typeof (body as { platform: unknown }).platform === "string" &&
    PLATFORMS.has((body as { platform: SocialPlatform }).platform)
  ) {
    platform = (body as { platform: SocialPlatform }).platform;
  }

  return {
    ok: true,
    body: { frames, platform, transcriptExcerpt, captionSummary },
  };
}
