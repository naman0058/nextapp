import type { SocialPlatform } from "@/types";

export type PlatformVideoGuidance = {
  platform: SocialPlatform;
  title: string;
  bullets: readonly string[];
};

export const PLATFORM_VIDEO_GUIDANCE: PlatformVideoGuidance[] = [
  {
    platform: "instagram",
    title: "Instagram video",
    bullets: [
      "Review generated or automatic captions for accuracy before publishing.",
      "Ensure meaningful spoken information appears in captions.",
      "Address important visual-only information in captions, on-screen text, or post copy as appropriate.",
      "Verify final caption behavior in the current Instagram publishing interface.",
    ],
  },
  {
    platform: "facebook",
    title: "Facebook video",
    bullets: [
      "Review captions for accuracy; some workflows support caption files such as SRT.",
      "Confirm caption settings in the workflow you use to publish video.",
      "Ensure visual-only information is communicated outside audio alone.",
    ],
  },
  {
    platform: "linkedin",
    title: "LinkedIn video",
    bullets: [
      "LinkedIn supports caption workflows in many video posting experiences.",
      "Review auto-generated captions and upload or apply caption files when supported.",
      "Verify presentation in the LinkedIn composer and player before publishing.",
    ],
  },
  {
    platform: "x",
    title: "X video",
    bullets: [
      "Caption options may vary by video and post workflow.",
      "Review caption availability and accuracy for your specific post type.",
      "Ensure important visual information is not conveyed by visuals alone.",
    ],
  },
];

export function getPlatformVideoGuidance(
  platform: SocialPlatform,
): PlatformVideoGuidance | undefined {
  return PLATFORM_VIDEO_GUIDANCE.find((g) => g.platform === platform);
}
