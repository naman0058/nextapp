export type RelatedToolLink = {
  label: string;
  href: string;
  description: string;
};

const TOOL_CATALOG: RelatedToolLink[] = [
  {
    label: "Website accessibility scanner",
    href: "/website-accessibility-scanner",
    description: "Automated WCAG-oriented checks for public pages.",
  },
  {
    label: "Image contrast checker",
    href: "/image-contrast-checker",
    description: "Measure contrast ratios before you publish visuals.",
  },
  {
    label: "Social media accessibility checker",
    href: "/social-media-accessibility-checker",
    description: "Preflight captions, hashtags, and alt text for social posts.",
  },
  {
    label: "Screen reader preview",
    href: "/screen-reader-preview",
    description: "Hear how copy and structure may read aloud.",
  },
  {
    label: "Video accessibility checker",
    href: "/video-accessibility-checker",
    description: "Review captions and media accessibility basics.",
  },
  {
    label: "Accessibility preflight report",
    href: "/accessibility-preflight-report",
    description: "Summarize findings for stakeholders.",
  },
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Website Accessibility": ["/website-accessibility-scanner", "/accessibility-preflight-report"],
  "Color Contrast": ["/image-contrast-checker"],
  "Social Media Accessibility": ["/social-media-accessibility-checker"],
  "Screen Readers": ["/screen-reader-preview"],
  "Video Accessibility": ["/video-accessibility-checker"],
  WCAG: ["/website-accessibility-scanner", "/methodology"],
};

const TAG_KEYWORDS: Record<string, string> = {
  contrast: "/image-contrast-checker",
  "alt text": "/social-media-accessibility-checker",
  caption: "/social-media-accessibility-checker",
  wcag: "/website-accessibility-scanner",
  keyboard: "/website-accessibility-scanner",
  forms: "/website-accessibility-scanner",
  video: "/video-accessibility-checker",
  captioning: "/video-accessibility-checker",
};

export function getRelatedToolsForPost(options: {
  category: string;
  tags: string[];
  limit?: number;
}): RelatedToolLink[] {
  const limit = options.limit ?? 3;
  const hrefs = new Set<string>();

  for (const href of CATEGORY_KEYWORDS[options.category] ?? []) {
    hrefs.add(href);
  }

  for (const tag of options.tags) {
    const key = tag.toLowerCase();
    for (const [needle, href] of Object.entries(TAG_KEYWORDS)) {
      if (key.includes(needle)) {
        hrefs.add(href);
      }
    }
  }

  if (hrefs.size === 0) {
    hrefs.add("/website-accessibility-scanner");
    hrefs.add("/social-media-accessibility-checker");
  }

  const picked: RelatedToolLink[] = [];
  for (const tool of TOOL_CATALOG) {
    if (hrefs.has(tool.href)) {
      picked.push(tool);
    }
    if (picked.length >= limit) break;
  }

  if (picked.length < limit) {
    for (const tool of TOOL_CATALOG) {
      if (picked.some((p) => p.href === tool.href)) continue;
      picked.push(tool);
      if (picked.length >= limit) break;
    }
  }

  return picked.slice(0, limit);
}
