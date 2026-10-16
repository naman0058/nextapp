import type { PlatformChecklistTemplateItem } from "@/features/accessibility/config/platformAccessibility/types";

export function coreImageChecklist(): PlatformChecklistTemplateItem[] {
  return [
    { id: "alt-text-prepared", label: "Image description prepared", kind: "automated" },
    {
      id: "image-text-covered",
      label: "Important text in image represented accessibly",
      kind: "automated",
    },
    {
      id: "caption-alt-duplication",
      label: "Alt text does not unnecessarily duplicate post copy",
      kind: "automated",
    },
    {
      id: "hashtag-readability",
      label: "Multi-word hashtags reviewed for capitalization",
      kind: "automated",
    },
    { id: "emoji-reviewed", label: "Repeated emoji reviewed", kind: "automated" },
    { id: "fancy-unicode", label: "Standard readable text (no decorative Unicode)", kind: "automated" },
    {
      id: "caption-context",
      label: "Important information appears in post/description",
      kind: "automated",
    },
    { id: "visual-contrast", label: "Visual contrast measured where relevant", kind: "automated" },
    {
      id: "link-wording",
      label: "Link wording reviewed",
      kind: "automated",
    },
    {
      id: "video-captions",
      label: "Video captions reviewed",
      kind: "automated",
      videoPhase6: true,
    },
    {
      id: "platform-alt-added",
      label: "Added/reviewed alt text on the platform",
      kind: "publishing_task",
    },
    {
      id: "platform-final-review",
      label: "Final review in platform composer",
      kind: "publishing_task",
    },
  ];
}

export const EXTERNAL_UI_NOTE =
  "Social platforms update their interfaces regularly. If the option appears in a different location, look for Alt Text, Alternative Text, Accessibility, Edit Photo, or Image Description controls.";

export const SOURCE_NOTE =
  "Platform guidance based on current official help documentation. Platform guidance reviewed: October 2026.";

export const NON_AFFILIATION =
  "Accessible Content Preflight is an independent tool and is not affiliated with Instagram, Facebook, LinkedIn, or X.";
