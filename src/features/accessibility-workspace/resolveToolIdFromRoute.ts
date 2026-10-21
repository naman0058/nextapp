import type { WorkspaceToolId } from "@/features/accessibility-workspace/types";

export function resolveToolIdFromHref(href: string): WorkspaceToolId | null {
  const path = href.split("?")[0] ?? href;
  if (path.includes("image-contrast-checker")) return "contrast_checker";
  if (path.includes("screen-reader-preview")) return "screen_reader_preview";
  if (path.includes("video-accessibility")) return "video_accessibility";
  if (path.includes("social-media-accessibility")) return "social_accessibility";
  if (
    path.includes("instagram-accessibility") ||
    path.includes("facebook-accessibility") ||
    path.includes("linkedin-accessibility") ||
    path.includes("x-accessibility")
  ) {
    return "platform_guidance";
  }
  return null;
}
