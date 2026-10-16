import type { ImagePurpose } from "@/features/accessibility/types/aiImageAnalysis";

export function buildImagePurposeNote(
  purpose: ImagePurpose | null | undefined,
): string | null {
  if (!purpose || purpose === "uncertain") {
    return "AI image purpose is uncertain. Human review is recommended before publishing.";
  }
  if (purpose === "decorative") {
    return "AI assessed this image as potentially decorative. Verify this based on publishing context.";
  }
  if (purpose === "informational") {
    return "AI assessed this image as informational. Ensure alt text conveys important visual information when publishing.";
  }
  if (purpose === "mixed") {
    return "AI assessed this image as mixed purpose. Recommend human review of alt text and caption together.";
  }
  return null;
}
