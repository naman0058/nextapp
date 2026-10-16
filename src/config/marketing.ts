export type MarketingTool = {
  name: string;
  href: string;
  description: string;
  badge: "live" | "planned";
  category: "social" | "visual" | "preview";
};

export const MARKETING_TOOLS: MarketingTool[] = [
  {
    name: "Social Media Checker",
    href: "/social-media-accessibility-checker",
    description:
      "Platform-neutral preflight for captions, alt text, contrast, and screen reader preview.",
    badge: "live",
    category: "social",
  },
  {
    name: "Instagram Checker",
    href: "/instagram-accessibility-checker",
    description: "Publishing checklist and alt-text guidance for Instagram posts.",
    badge: "live",
    category: "social",
  },
  {
    name: "Facebook Checker",
    href: "/facebook-accessibility-checker",
    description: "Photo alternative text and feed post readiness for Facebook.",
    badge: "live",
    category: "social",
  },
  {
    name: "LinkedIn Checker",
    href: "/linkedin-accessibility-checker",
    description: "Professional feed images, captions, and alt text for LinkedIn.",
    badge: "live",
    category: "social",
  },
  {
    name: "X Checker",
    href: "/x-accessibility-checker",
    description: "Image descriptions, hashtags, and the 1,000-character limit.",
    badge: "live",
    category: "social",
  },
  {
    name: "Image Contrast Checker",
    href: "/image-contrast-checker",
    description: "Measure WCAG contrast ratios locally with sampling or hex input.",
    badge: "live",
    category: "visual",
  },
  {
    name: "Screen Reader Preview",
    href: "/screen-reader-preview",
    description: "Approximate reading order and listening noise—not an emulator.",
    badge: "live",
    category: "preview",
  },
  {
    name: "Video Accessibility",
    href: "/video-accessibility-checker",
    description:
      "Transcripts, editable timed captions, SRT/WebVTT export, and caption-quality review for MP4/WebM.",
    badge: "live",
    category: "preview",
  },
  {
    name: "Batch Accessibility Checker",
    href: "/batch-accessibility-checker",
    badge: "live",
    category: "social",
    description:
      "Review multiple social posts at once using CSV import, optional image matching, bulk local checks and controlled AI image analysis.",
  },
  {
    name: "Website Accessibility Scanner",
    href: "/website-accessibility-scanner",
    description:
      "Scan public websites with Playwright and axe-core; single page or limited same-origin crawl with exports and human review.",
    badge: "live",
    category: "visual",
  },
];

export const TRUST_SIGNALS = [
  { label: "Local rule checks", detail: "Phase 1 runs in your browser" },
  { label: "Measured contrast", detail: "WCAG luminance math" },
  { label: "Optional AI review", detail: "Explicit action only" },
  { label: "4 social platforms", detail: "IG, FB, LinkedIn, X" },
] as const;
