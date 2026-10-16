export type SeoPageType =
  | "PRIMARY_TOOL"
  | "PLATFORM_TOOL"
  | "CONTENT"
  | "BLOG_INDEX"
  | "BLOG_ARTICLE"
  | "BLOG_CATEGORY"
  | "TRUST_LEGAL"
  | "SAMPLE"
  | "UTILITY";

export type RouteSeoEntry = {
  path: string;
  pageType: SeoPageType;
  primaryIntent: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  index: boolean;
  includeInSitemap: boolean;
  title: string;
  description: string;
  h1Note: string;
  structuredData: string[];
  ogStrategy: "default" | "priority";
  editorialKeywords?: string[];
};

export const STATIC_ROUTE_SEO: RouteSeoEntry[] = [
  {
    path: "/",
    pageType: "CONTENT",
    primaryIntent: "Hub for free accessibility preflight tools",
    primaryKeyword: "accessibility preflight tools",
    secondaryKeywords: ["free accessibility tools", "accessibility testing tools"],
    index: true,
    includeInSitemap: true,
    title: "Free Accessibility Preflight Tools for Web & Social",
    description:
      "Run accessibility preflight on websites, social posts, images, and video before you publish. Local checks, optional AI, human-review guidance, and exportable reports—not compliance certification.",
    h1Note: "Publish social content people can actually access (functional proposition)",
    structuredData: ["WebSite", "Organization"],
    ogStrategy: "priority",
  },
  {
    path: "/social-media-accessibility-checker",
    pageType: "PRIMARY_TOOL",
    primaryIntent: "Check social posts before publishing",
    primaryKeyword: "social media accessibility checker",
    secondaryKeywords: ["accessible social media checker", "social post accessibility"],
    index: true,
    includeInSitemap: true,
    title: "Social Media Accessibility Checker",
    description:
      "Check captions, alt text, contrast, and platform publishing tasks for social posts. Local preflight by default; optional AI image review only when you choose it.",
    h1Note: "Social Media Accessibility Checker",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
  {
    path: "/instagram-accessibility-checker",
    pageType: "PLATFORM_TOOL",
    primaryIntent: "Instagram post accessibility preflight",
    primaryKeyword: "Instagram accessibility checker",
    secondaryKeywords: ["Instagram alt text", "accessible Instagram posts"],
    index: true,
    includeInSitemap: true,
    title: "Instagram Accessibility Checker",
    description:
      "Prepare Instagram alt text, captions, hashtags, and contrast before publishing. Independent tool—not affiliated with Meta or Instagram.",
    h1Note: "Instagram Accessibility Checker",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
  {
    path: "/facebook-accessibility-checker",
    pageType: "PLATFORM_TOOL",
    primaryIntent: "Facebook post accessibility preflight",
    primaryKeyword: "Facebook accessibility checker",
    secondaryKeywords: ["Facebook alt text", "accessible Facebook posts"],
    index: true,
    includeInSitemap: true,
    title: "Facebook Accessibility Checker",
    description:
      "Review Facebook photo alternative text, captions, contrast, and publishing readiness before you post.",
    h1Note: "Facebook Accessibility Checker",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
  {
    path: "/linkedin-accessibility-checker",
    pageType: "PLATFORM_TOOL",
    primaryIntent: "LinkedIn post accessibility preflight",
    primaryKeyword: "LinkedIn accessibility checker",
    secondaryKeywords: ["LinkedIn alt text", "accessible LinkedIn posts"],
    index: true,
    includeInSitemap: true,
    title: "LinkedIn Accessibility Checker",
    description:
      "Preflight LinkedIn posts with accessible alt text, professional captions, hashtags, and measured contrast before publishing.",
    h1Note: "LinkedIn Accessibility Checker",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
  {
    path: "/x-accessibility-checker",
    pageType: "PLATFORM_TOOL",
    primaryIntent: "X post accessibility preflight",
    primaryKeyword: "X accessibility checker",
    secondaryKeywords: ["Twitter accessibility checker", "X image description"],
    index: true,
    includeInSitemap: true,
    title: "X Accessibility Checker",
    description:
      "Prepare X image descriptions, captions, and hashtags before posting. Not affiliated with X Corp.",
    h1Note: "X (Twitter) Accessibility Checker",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
  {
    path: "/image-contrast-checker",
    pageType: "PRIMARY_TOOL",
    primaryIntent: "Measure WCAG contrast",
    primaryKeyword: "color contrast checker",
    secondaryKeywords: ["WCAG contrast checker", "text contrast checker"],
    index: true,
    includeInSitemap: true,
    title: "Color Contrast Checker",
    description:
      "Measure WCAG contrast ratios locally in your browser. Sample colors from images or enter hex values—numeric guidance, not certification.",
    h1Note: "Image Contrast Checker",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
  {
    path: "/screen-reader-preview",
    pageType: "PRIMARY_TOOL",
    primaryIntent: "Approximate listening experience for social content",
    primaryKeyword: "screen reader preview",
    secondaryKeywords: ["screen reader text preview", "accessible content preview"],
    index: true,
    includeInSitemap: true,
    title: "Screen Reader Preview",
    description:
      "Approximate reading order and listening noise for social captions and alt text in your browser—not an NVDA, JAWS, or VoiceOver emulator.",
    h1Note: "Screen Reader Experience Preview",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
  {
    path: "/video-accessibility-checker",
    pageType: "PRIMARY_TOOL",
    primaryIntent: "Video caption and accessibility preflight",
    primaryKeyword: "video accessibility checker",
    secondaryKeywords: ["caption accessibility checker", "video caption checker"],
    index: true,
    includeInSitemap: true,
    title: "Video Accessibility Checker",
    description:
      "Review timed captions, transcripts, and optional sampled-frame visual checks for prerecorded video before publishing. Human review recommended.",
    h1Note: "Video Accessibility Checker",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
  {
    path: "/batch-accessibility-checker",
    pageType: "PRIMARY_TOOL",
    primaryIntent: "Bulk social accessibility review",
    primaryKeyword: "batch accessibility checker",
    secondaryKeywords: ["bulk accessibility review", "batch social accessibility"],
    index: true,
    includeInSitemap: true,
    title: "Batch Accessibility Checker",
    description:
      "Import up to 100 social posts via CSV, run local accessibility checks in your browser, optionally queue AI image review, and export results.",
    h1Note: "Batch Accessibility Preflight",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
  {
    path: "/website-accessibility-scanner",
    pageType: "PRIMARY_TOOL",
    primaryIntent: "Automated website WCAG scan",
    primaryKeyword: "website accessibility scanner",
    secondaryKeywords: ["website accessibility checker", "free WCAG website checker"],
    index: true,
    includeInSitemap: true,
    title: "Website Accessibility Scanner",
    description:
      "Scan public web pages with rendered-browser axe-core checks, root-cause grouping, fix guidance, and human-review signals—automated testing only, not legal certification.",
    h1Note: "Website Accessibility Scanner",
    structuredData: ["WebPage"],
    ogStrategy: "priority",
  },
  {
    path: "/sample-accessibility-report",
    pageType: "SAMPLE",
    primaryIntent: "Example website accessibility report",
    primaryKeyword: "sample accessibility report",
    secondaryKeywords: [
      "website accessibility report example",
      "WCAG report example",
    ],
    index: true,
    includeInSitemap: true,
    title: "Sample Website Accessibility Report",
    description:
      "Explore a fictional accessibility preflight report with root causes, fix plan, human-review checks, and sample PDF and Excel exports—no signup required.",
    h1Note: "See what an accessibility preflight report looks like",
    structuredData: ["WebPage", "BreadcrumbList"],
    ogStrategy: "priority",
  },
  {
    path: "/accessibility-preflight-report",
    pageType: "CONTENT",
    primaryIntent: "How to generate preflight reports from tools",
    primaryKeyword: "accessibility preflight report",
    secondaryKeywords: ["accessibility report export", "PDF accessibility report"],
    index: true,
    includeInSitemap: true,
    title: "Accessibility Preflight Report",
    description:
      "Generate browser-based preflight reports with PDF, print, and JSON export from checks you already ran—without storing draft content on our servers.",
    h1Note: "Accessibility preflight report",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
  {
    path: "/methodology",
    pageType: "CONTENT",
    primaryIntent: "Explain testing methodology and limits",
    primaryKeyword: "accessibility testing methodology",
    secondaryKeywords: ["automated vs manual accessibility testing", "accessibility testing process"],
    index: true,
    includeInSitemap: true,
    title: "Accessibility Testing Methodology",
    description:
      "How we combine automated axe checks, measured contrast, optional AI assistance, human-review libraries, and root-cause grouping—with clear limitations.",
    h1Note: "Methodology",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
  {
    path: "/tools",
    pageType: "UTILITY",
    primaryIntent: "Directory of all preflight tools",
    primaryKeyword: "accessibility tools",
    secondaryKeywords: ["free accessibility checkers", "preflight tools"],
    index: true,
    includeInSitemap: true,
    title: "All Accessibility Tools",
    description:
      "Browse every live preflight tool—social, platform, contrast, screen reader preview, video, batch, and website scanning.",
    h1Note: "All accessibility tools",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
  {
    path: "/blog",
    pageType: "BLOG_INDEX",
    primaryIntent: "Accessibility guides and resources",
    primaryKeyword: "accessibility guides",
    secondaryKeywords: ["WCAG guides", "website accessibility resources"],
    index: true,
    includeInSitemap: true,
    title: "Accessibility Guides & Resources",
    description:
      "Practical WCAG, alt text, contrast, keyboard, and social accessibility guides from Accessible Content Preflight.",
    h1Note: "Accessibility guides",
    structuredData: ["WebPage"],
    ogStrategy: "priority",
  },
  {
    path: "/about",
    pageType: "TRUST_LEGAL",
    primaryIntent: "Brand and product clarity",
    primaryKeyword: "Accessible Content Preflight",
    secondaryKeywords: ["about accessibility preflight"],
    index: true,
    includeInSitemap: true,
    title: "About Accessible Content Preflight",
    description:
      "What Accessible Content Preflight does, who it helps, how checks run in your browser, and important limitations—no compliance certification claims.",
    h1Note: "About",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
  {
    path: "/contact",
    pageType: "TRUST_LEGAL",
    primaryIntent: "Support and feedback contact",
    primaryKeyword: "contact",
    secondaryKeywords: ["accessibility feedback"],
    index: true,
    includeInSitemap: true,
    title: "Contact",
    description: "Contact Accessible Content Preflight for product support and accessibility feedback.",
    h1Note: "Contact",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
  {
    path: "/privacy",
    pageType: "TRUST_LEGAL",
    primaryIntent: "Privacy policy",
    primaryKeyword: "privacy policy",
    secondaryKeywords: [],
    index: true,
    includeInSitemap: true,
    title: "Privacy Policy",
    description: "Privacy policy for Accessible Content Preflight—what data is processed and how.",
    h1Note: "Privacy Policy",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
  {
    path: "/terms",
    pageType: "TRUST_LEGAL",
    primaryIntent: "Terms of use",
    primaryKeyword: "terms of use",
    secondaryKeywords: [],
    index: true,
    includeInSitemap: true,
    title: "Terms of Use",
    description: "Terms of use for Accessible Content Preflight tools and website.",
    h1Note: "Terms of Use",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
  {
    path: "/disclaimer",
    pageType: "TRUST_LEGAL",
    primaryIntent: "Automated guidance disclaimer",
    primaryKeyword: "disclaimer",
    secondaryKeywords: [],
    index: true,
    includeInSitemap: true,
    title: "Disclaimer",
    description: "Disclaimer for automated accessibility guidance from Accessible Content Preflight.",
    h1Note: "Disclaimer",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
  {
    path: "/accessibility",
    pageType: "TRUST_LEGAL",
    primaryIntent: "Accessibility statement",
    primaryKeyword: "accessibility statement",
    secondaryKeywords: [],
    index: true,
    includeInSitemap: true,
    title: "Accessibility Statement",
    description: "Accessibility statement for the Accessible Content Preflight website and feedback channel.",
    h1Note: "Accessibility Statement",
    structuredData: ["WebPage"],
    ogStrategy: "default",
  },
];

export function getStaticRouteSeo(path: string): RouteSeoEntry | undefined {
  const normalized = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  return STATIC_ROUTE_SEO.find((r) => r.path === normalized);
}

export function getIndexableStaticSitemapPaths(): string[] {
  return STATIC_ROUTE_SEO.filter((r) => r.includeInSitemap).map((r) =>
    r.path === "/" ? "" : r.path,
  );
}

export type RelatedResourceLink = { href: string; label: string };

export function getRelatedResourcesForPath(path: string): RelatedResourceLink[] {
  const common: RelatedResourceLink[] = [
    { href: "/methodology", label: "Testing methodology" },
  ];
  if (path === "/website-accessibility-scanner") {
    return [
      { href: "/sample-accessibility-report", label: "View sample website report" },
      { href: "/methodology", label: "How automated testing works" },
      { href: "/blog", label: "Accessibility guides" },
    ];
  }
  if (path.includes("contrast")) {
    return [...common, { href: "/blog", label: "Color contrast guides" }];
  }
  if (path.includes("video")) {
    return [...common, { href: "/blog", label: "Video accessibility guides" }];
  }
  if (path.includes("social") || path.includes("instagram") || path.includes("facebook") || path.includes("linkedin") || path.includes("x-accessibility")) {
    return [...common, { href: "/tools", label: "All accessibility tools" }];
  }
  return common;
}
