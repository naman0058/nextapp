export type NavLink = {
  label: string;
  href: string;
};

export type FooterSection = {
  title: string;
  links: NavLink[];
};

export const siteConfig = {
  name: "Accessible Content Preflight",
  shortName: "Content Preflight",
  tagline: "Accessibility preflight for social content teams",
  description:
    "Check and improve the accessibility readiness of social media and digital content before publishing.",
  url: "https://contentpreflight.example.com",
  contact: {
    email: "support@contentpreflight.example.com",
  },
  social: {
    twitter: "",
    linkedin: "",
    github: "",
  },
  seo: {
    defaultTitle: "Accessible Content Preflight",
    titleTemplate: "%s | Accessible Content Preflight",
    defaultDescription:
      "Check and improve the accessibility readiness of social media and digital content before publishing.",
  },
  nav: {
    primary: [
      { label: "Tools", href: "/tools" },
      { label: "Blog", href: "/blog" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Methodology", href: "/methodology" },
      { label: "About", href: "/about" },
    ] satisfies NavLink[],
    cta: {
      label: "Start free preflight",
      href: "/social-media-accessibility-checker",
    },
  },
  footer: {
    sections: [
      {
        title: "Product",
        links: [
          { label: "Social Media Checker", href: "/social-media-accessibility-checker" },
          { label: "Instagram Checker", href: "/instagram-accessibility-checker" },
          { label: "Facebook Checker", href: "/facebook-accessibility-checker" },
          { label: "LinkedIn Checker", href: "/linkedin-accessibility-checker" },
          { label: "X Checker", href: "/x-accessibility-checker" },
          { label: "Image Contrast Checker", href: "/image-contrast-checker" },
          { label: "Screen Reader Preview", href: "/screen-reader-preview" },
          { label: "Website Scanner", href: "/website-accessibility-scanner" },
          { label: "Video Checker", href: "/video-accessibility-checker" },
          { label: "Batch Checker", href: "/batch-accessibility-checker" },
          { label: "All tools", href: "/tools" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Blog", href: "/blog" },
          { label: "Methodology", href: "/methodology" },
          { label: "Sample website report", href: "/sample-accessibility-report" },
          { label: "Preflight report info", href: "/accessibility-preflight-report" },
          { label: "Guides", href: "/#capabilities" },
          { label: "FAQ", href: "/#faq" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
          { label: "Disclaimer", href: "/disclaimer" },
          { label: "Accessibility Statement", href: "/accessibility" },
        ],
      },
    ] satisfies FooterSection[],
  },
} as const;
