import type { SpecializedToolRoute } from "@/features/website-scanner/findingDetail/types";

const ROUTES: { match: RegExp; route: SpecializedToolRoute }[] = [
  {
    match: /color-contrast|non-text-contrast|link-in-text-block/i,
    route: { href: "/image-contrast-checker", label: "Contrast checker" },
  },
  {
    match: /image-alt|object-alt|svg-img-alt|input-image-alt|area-alt|role-img-alt/i,
    route: { href: "/image-contrast-checker", label: "Image / alt text tools" },
  },
  {
    match: /heading-order|empty-heading|landmark|region|bypass|skip-link|p-as-heading/i,
    route: { href: "/screen-reader-preview", label: "Screen reader preview" },
  },
  {
    match: /video-caption|audio-caption|video-description|no-autoplay-audio/i,
    route: {
      href: "/video-accessibility-checker",
      label: "Video accessibility checker",
    },
  },
];

export function specializedToolForRule(ruleId: string): SpecializedToolRoute | undefined {
  return ROUTES.find((r) => r.match.test(ruleId))?.route;
}
