import type { PlatformAccessibilityConfig } from "@/features/accessibility/config/platformAccessibility/types";
export const linkedinPlatformConfig: PlatformAccessibilityConfig = {
  id: "linkedin",
  name: "LinkedIn",
  shortDescription:
    "Review image alt text, business graphics, captions, and visual accessibility before publishing to LinkedIn.",
  seoIntro:
    "Preflight LinkedIn feed posts with accessible alt text, professional captions, readable hashtags, and measured contrast—before you publish.",
  guidanceVersion: "2026.10",
  imageDescriptionLimit: null,
  capabilities: {
    imageAltText: {
      status: "supported",
      label: "Custom alt text on feed images",
      note: "Users can provide alt text; LinkedIn may also generate alt text when custom text is not provided.",
    },
    multipleImageAltText: {
      status: "varies",
      label: "Multiple images",
      note: "Review each meaningful image when posting multiple assets.",
    },
    videoCaptions: {
      status: "supported",
      label: "Video captions",
      note: "LinkedIn supports captions and auto-generated captions for supported languages in many workflows.",
    },
    automaticCaptions: {
      status: "supported",
      label: "Automatic captions",
      note: "Auto captions may need review; full video analysis is Phase 6.",
    },
    manualCaptionUpload: {
      status: "varies",
      label: "Caption file upload",
      note: "Supported in some video posting experiences.",
    },
  },
  publishingGuidance: [
    {
      id: "li-alt",
      title: "Author-reviewed alt text",
      body: "Add meaningful alt text for business graphics, charts, and event flyers. Do not rely solely on automatic alt text when context matters.",
    },
    {
      id: "li-text-in-image",
      title: "Text in graphics",
      body: "Review text embedded in images and repeat critical information in the caption when appropriate.",
    },
    {
      id: "li-video",
      title: "Video",
      body: "LinkedIn supports captions for uploaded video. Video analysis will be available in Phase 6.",
    },
  ],
  checklist: [
    { id: "alt-text-prepared", label: "Custom alt text prepared", kind: "automated" },
    { id: "image-text-covered", label: "Important image text covered", kind: "automated" },
    { id: "caption-alt-duplication", label: "Caption/alt-text duplication reviewed", kind: "automated" },
    { id: "hashtag-readability", label: "Hashtags reviewed", kind: "automated" },
    { id: "emoji-reviewed", label: "Emoji use reviewed", kind: "automated" },
    { id: "fancy-unicode", label: "Fancy Unicode reviewed", kind: "automated" },
    { id: "visual-contrast", label: "Contrast reviewed", kind: "automated" },
    { id: "link-wording", label: "Link wording reviewed", kind: "automated" },
    {
      id: "video-captions",
      label: "Video captions reviewed",
      kind: "automated",
      videoPhase6: true,
    },
    {
      id: "platform-alt-added",
      label: "Added/reviewed alt text in LinkedIn",
      kind: "publishing_task",
    },
    {
      id: "platform-final-review",
      label: "Final review before publishing",
      kind: "publishing_task",
    },
  ],
  helpSteps: [
    "Add an image to your post.",
    "Use LinkedIn's alt-text option for the image.",
    "Paste or review your prepared description.",
    "Complete your caption.",
    "Review before publishing.",
  ],
  faq: [
    {
      question: "Does LinkedIn support image alt text?",
      answer:
        "LinkedIn supports custom alt text on many feed images. Automatic alt text may not replace author context.",
    },
    {
      question: "Does LinkedIn support video captions?",
      answer:
        "Yes for many video workflows. This tool does not analyze video yet; Phase 6 will add video accessibility.",
    },
    {
      question: "Does this publish to LinkedIn?",
      answer: "No. Copy prepared content into LinkedIn when posting.",
    },
  ],
  sourceMetadata: {
    lastReviewed: "2026-10-08",
    sourceLabels: ["LinkedIn Help"],
  },
};
