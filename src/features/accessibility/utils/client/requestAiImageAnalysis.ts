import type { AIImageAccessibilityAnalysis } from "@/features/accessibility/types/aiImageAnalysis";
import type { SocialPlatform } from "@/types";

export class AiRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "AiRequestError";
  }
}

export async function requestAiImageAnalysis(options: {
  imageBlob: Blob;
  fileName: string;
  platform: SocialPlatform;
  caption: string;
  altText: string;
}): Promise<AIImageAccessibilityAnalysis> {
  const formData = new FormData();
  formData.append("image", options.imageBlob, options.fileName);
  formData.append("platform", options.platform);
  formData.append("caption", options.caption);
  formData.append("altText", options.altText);

  const response = await fetch("/api/accessibility/analyze-image", {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | AIImageAccessibilityAnalysis
    | { error?: string; retryAfterMs?: number }
    | null;

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "AI image analysis could not be completed.";
    throw new AiRequestError(message, response.status);
  }

  if (!payload || typeof payload !== "object" || !("suggestedAltText" in payload)) {
    throw new AiRequestError("Unexpected AI response.");
  }

  return payload as AIImageAccessibilityAnalysis;
}
