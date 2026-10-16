export type ToolPageId =
  | "social"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "x"
  | "contrast"
  | "screen-reader"
  | "video"
  | "batch"
  | "website";

export type ToolPageDefinition = {
  id: ToolPageId;
  path: string;
  navLabel: string;
  name: string;
  eyebrow: string;
  title: string;
  description: string;
  highlights: readonly string[];
  whatItChecks: readonly string[];
  whatItDoesNot: readonly string[];
};

export const TOOL_PAGE_LIST: ToolPageDefinition[] = [
  {
    id: "social",
    path: "/social-media-accessibility-checker",
    navLabel: "Social",
    name: "Social Media Checker",
    eyebrow: "Flagship workspace",
    title: "Social Media Accessibility Checker",
    description:
      "Platform-neutral preflight for captions, alt text, measured contrast, screen reader preview, optional AI image review, and publishing readiness.",
    highlights: [
      "All platforms in one workspace",
      "Local preflight at zero API cost",
      "Optional AI on your click only",
    ],
    whatItChecks: [
      "Caption readability, hashtags, emoji, and Unicode patterns",
      "Alt-text readiness when an image is present",
      "WCAG contrast sampling and screen reader preview",
      "Publishing checklist for the platform you select",
    ],
    whatItDoesNot: [
      "Connect to social accounts or publish posts",
      "Certify ADA, WCAG, or legal compliance",
      "Transcribe or caption video (use the Video Accessibility Checker)",
    ],
  },
  {
    id: "instagram",
    path: "/instagram-accessibility-checker",
    navLabel: "Instagram",
    name: "Instagram Accessibility Checker",
    eyebrow: "Instagram preflight",
    title: "Instagram Accessibility Checker",
    description:
      "Prepare Instagram alt text, accessible captions, readable hashtags, and graphic contrast before you post. Not affiliated with Meta or Instagram.",
    highlights: [
      "Instagram publishing checklist",
      "Alt text & caption preflight",
      "Carousel-aware guidance",
    ],
    whatItChecks: [
      "Caption and alt-text heuristics for feed posts",
      "Platform-specific publishing confirmations",
      "Visual contrast and screen reader preview (local)",
    ],
    whatItDoesNot: [
      "Verify controls inside the Instagram app",
      "Guarantee platform UI labels match your device",
      "Replace human review before you tap Share",
    ],
  },
  {
    id: "facebook",
    path: "/facebook-accessibility-checker",
    navLabel: "Facebook",
    name: "Facebook Accessibility Checker",
    eyebrow: "Facebook preflight",
    title: "Facebook Accessibility Checker",
    description:
      "Preflight Facebook photo alternative text, captions, and feed post accessibility before publishing. Independent tool—not affiliated with Meta.",
    highlights: [
      "Photo alt-text guidance",
      "Feed post readability checks",
      "Publishing copy package",
    ],
    whatItChecks: [
      "Caption clarity and link wording",
      "Alt text when images are included",
      "Facebook-specific checklist items",
    ],
    whatItDoesNot: [
      "Access your Facebook account",
      "Validate automatic alt text from Facebook",
      "Certify legal compliance",
    ],
  },
  {
    id: "linkedin",
    path: "/linkedin-accessibility-checker",
    navLabel: "LinkedIn",
    name: "LinkedIn Accessibility Checker",
    eyebrow: "LinkedIn preflight",
    title: "LinkedIn Accessibility Checker",
    description:
      "Professional feed post preflight: alt text, captions, hashtags, and measured contrast before LinkedIn publishing.",
    highlights: [
      "Professional post readiness",
      "Feed image alt-text review",
      "LinkedIn checklist & guidance",
    ],
    whatItChecks: [
      "Caption and hashtag readability",
      "Alt text for feed images",
      "Contrast and listening preview locally",
    ],
    whatItDoesNot: [
      "Post to LinkedIn on your behalf",
      "Override LinkedIn-generated alt text automatically",
      "Certify WCAG or ADA compliance",
    ],
  },
  {
    id: "x",
    path: "/x-accessibility-checker",
    navLabel: "X",
    name: "X Accessibility Checker",
    eyebrow: "X preflight",
    title: "X (Twitter) Accessibility Checker",
    description:
      "Prepare X image descriptions (up to the documented 1,000-character limit), captions, and hashtags before you post. Not affiliated with X Corp.",
    highlights: [
      "1,000-character image description awareness",
      "Hashtag & caption preflight",
      "X publishing checklist",
    ],
    whatItChecks: [
      "Alt text / image description length for X",
      "Caption noise and readability",
      "Platform publishing confirmations",
    ],
    whatItDoesNot: [
      "Post to X or read your account",
      "Truncate alt text automatically",
      "Guarantee compliance with X policies",
    ],
  },
  {
    id: "contrast",
    path: "/image-contrast-checker",
    navLabel: "Contrast",
    name: "Image Contrast Checker",
    eyebrow: "Visual accessibility",
    title: "Image Contrast Checker",
    description:
      "Measure WCAG contrast ratios in your browser. Sample colors from images or enter hex values—numeric measurement, not certification.",
    highlights: [
      "WCAG relative luminance math",
      "Image pixel sampling",
      "Accessible color suggestions",
    ],
    whatItChecks: [
      "Contrast ratio between foreground and background",
      "AA/AAA threshold comparison",
      "Multi-sample regions on photos",
    ],
    whatItDoesNot: [
      "Call AI or upload images to our server",
      "Replace design-system audits",
      "Certify entire documents or brands",
    ],
  },
  {
    id: "screen-reader",
    path: "/screen-reader-preview",
    navLabel: "Preview",
    name: "Screen Reader Preview",
    eyebrow: "Listening experience",
    title: "Screen Reader Experience Preview",
    description:
      "Approximate reading order, hashtag noise, and optional browser speech—local preview only, not an NVDA/JAWS/VoiceOver emulator.",
    highlights: [
      "Reading order approximation",
      "Optional speech playback",
      "Accessible draft suggestions",
    ],
    whatItChecks: [
      "Caption/alt duplication and emoji noise",
      "Hashtag listening fatigue indicators",
      "Linear reading order for social posts",
    ],
    whatItDoesNot: [
      "Emulate a specific screen reader product",
      "Guarantee real assistive tech output",
      "Send content to our servers",
    ],
  },
  {
    id: "video",
    path: "/video-accessibility-checker",
    navLabel: "Video",
    name: "Video Accessibility Checker",
    eyebrow: "Prerecorded video",
    title: "Video Accessibility Checker",
    description:
      "Video accessibility preflight: timestamped captions, transcript review, SRT/WebVTT export, and optional sampled-frame visual guidance — human review recommended.",
    highlights: [
      "MP4/WebM upload with local preview",
      "One transcription pass for cues + exports",
      "Optional speaker detection & visual review",
    ],
    whatItChecks: [
      "Timed caption cues and reading-speed heuristics",
      "Non-speech audio review prompts",
      "Platform video publishing checklist",
    ],
    whatItDoesNot: [
      "Certify ADA, WCAG, or legal compliance",
      "Burn captions into video or publish to social platforms",
      "Translate captions or live-stream captioning",
    ],
  },
  {
    id: "batch",
    path: "/batch-accessibility-checker",
    navLabel: "Batch",
    name: "Batch Accessibility Checker",
    eyebrow: "Bulk preflight",
    title: "Batch Accessibility Preflight",
    description:
      "Import up to 100 social posts via CSV, optionally match images from ZIP, run local accessibility checks at zero API cost, and run AI image review only for items you select.",
    highlights: [
      "CSV + optional ZIP import in-browser",
      "Shared Phase 1–5 engines per row",
      "Controlled AI queue with session limits",
    ],
    whatItChecks: [
      "Caption, hashtag, emoji, and alt-text heuristics for each row",
      "Screen reader experience summaries and platform checklists",
      "Optional AI image review for selected rows only",
    ],
    whatItDoesNot: [
      "Batch video transcription or website scanning",
      "Automatically run AI on every row",
      "Certify compliance or store your batch on our servers",
    ],
  },
  {
    id: "website",
    path: "/website-accessibility-scanner",
    navLabel: "Website",
    name: "Website Accessibility Scanner",
    eyebrow: "Public URL scanning",
    title: "Website Accessibility Scanner",
    description:
      "Scan public pages with server-side Playwright rendering and axe-core WCAG checks. Single-page or limited same-origin crawl with human-review checklist and optional AI fix guidance.",
    highlights: [
      "JavaScript-rendered page support",
      "WCAG A/AA automated findings",
      "No compliance certification claims",
    ],
    whatItChecks: [
      "axe-core violations and incomplete checks on rendered HTML",
      "Desktop or mobile viewport (one per scan)",
      "Same-origin crawl up to configured page limit",
    ],
    whatItDoesNot: [
      "Scan login-protected or private pages",
      "Certify ADA, WCAG, or legal compliance",
      "Replace keyboard, screen reader, or manual expert review",
    ],
  },
];

export function getToolPageByPath(path: string): ToolPageDefinition | undefined {
  return TOOL_PAGE_LIST.find((t) => t.path === path);
}

export function getToolPageById(id: ToolPageId): ToolPageDefinition {
  const found = TOOL_PAGE_LIST.find((t) => t.id === id);
  if (!found) throw new Error(`Unknown tool page: ${id}`);
  return found;
}
