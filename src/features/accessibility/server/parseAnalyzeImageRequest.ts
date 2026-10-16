import { ACCEPTED_IMAGE_MIME_TYPES } from "@/constants";
import {
  MAX_AI_IMAGE_SIZE_BYTES,
  MAX_ALT_TEXT_LENGTH,
  MAX_CAPTION_LENGTH,
} from "@/features/accessibility/constants/aiLimits";
import { PHASE1_SOCIAL_PLATFORMS } from "@/features/accessibility/constants/platforms";
import type { SocialPlatform } from "@/types";

const ALLOWED_MIMES = new Set<string>(ACCEPTED_IMAGE_MIME_TYPES);

export type ParsedAnalyzeImageRequest = {
  imageBytes: Buffer;
  mimeType: string;
  platform: SocialPlatform;
  caption: string;
  altText: string;
};

export type ParseError = {
  status: 400 | 413;
  message: string;
};

export async function parseAnalyzeImageRequest(
  formData: FormData,
): Promise<ParsedAnalyzeImageRequest | ParseError> {
  const image = formData.get("image");
  const platform = formData.get("platform");
  const caption = formData.get("caption");
  const altText = formData.get("altText");

  if (!(image instanceof File)) {
    return { status: 400, message: "Image file is required." };
  }

  const mimeType = image.type.toLowerCase();
  if (mimeType === "image/svg+xml" || image.name.toLowerCase().endsWith(".svg")) {
    return {
      status: 400,
      message: "SVG is not supported for AI image analysis.",
    };
  }

  if (!ALLOWED_MIMES.has(mimeType)) {
    return {
      status: 400,
      message: "Unsupported image type. Use PNG, JPG, JPEG, or WEBP.",
    };
  }

  if (image.size > MAX_AI_IMAGE_SIZE_BYTES) {
    return { status: 413, message: "Maximum image size: 10 MB." };
  }

  if (typeof platform !== "string") {
    return { status: 400, message: "Platform is required." };
  }

  if (!PHASE1_SOCIAL_PLATFORMS.includes(platform as SocialPlatform)) {
    return { status: 400, message: "Unsupported platform." };
  }

  const captionStr = typeof caption === "string" ? caption : "";
  const altStr = typeof altText === "string" ? altText : "";

  if (captionStr.length > MAX_CAPTION_LENGTH) {
    return { status: 400, message: "Caption is too long." };
  }

  if (altStr.length > MAX_ALT_TEXT_LENGTH) {
    return { status: 400, message: "Alt text is too long." };
  }

  const arrayBuffer = await image.arrayBuffer();
  const imageBytes = Buffer.from(arrayBuffer);

  return {
    imageBytes,
    mimeType,
    platform: platform as SocialPlatform,
    caption: captionStr,
    altText: altStr,
  };
}
