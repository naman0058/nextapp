import type { SocialPlatform } from "@/types";

export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

/** Phase 6 video upload (see video-accessibility-checker). */
export { ACCEPTED_VIDEO_MIME_TYPES } from "@/features/video/constants/videoLimits";

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  tiktok: "TikTok",
  youtube: "YouTube",
};

export const FAQ_ITEMS = [
  {
    question: "What is an accessibility preflight?",
    answer:
      "An accessibility preflight is a set of automated checks and guidance you run on content before publishing. It helps surface common accessibility issues early so you can improve captions, images, contrast, and other elements that affect how people access your content.",
  },
  {
    question: "Does this tool certify ADA compliance?",
    answer:
      "No. The service is intended to assist with accessibility checks and guidance. Automated tools cannot guarantee complete legal or standards compliance, and some accessibility requirements require human review.",
  },
  {
    question: "Will my uploaded content be stored?",
    answer:
      "Local preflight, contrast, and screen reader preview run in your browser. Caption and alt text may be kept in session storage when you move between checker pages in the same tab. Optional AI image analysis sends content to our server and OpenAI only when you click Analyze—we do not intentionally persist uploads in a database.",
  },
  {
    question: "Which social platforms are supported?",
    answer:
      "V1 includes dedicated preflight flows for Instagram, Facebook, LinkedIn, and X, plus a platform-neutral social checker. Guidance is based on platform help documentation and accessibility best practices—not live account connections.",
  },
  {
    question: "Is the tool free?",
    answer:
      "Core preflight tools are free to use. Optional AI image analysis uses server resources and OpenAI when configured; local checks remain available at no API cost.",
  },
] as const;
