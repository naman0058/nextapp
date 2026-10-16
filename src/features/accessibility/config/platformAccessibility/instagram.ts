import type { PlatformAccessibilityConfig } from "@/features/accessibility/config/platformAccessibility/types";
export const instagramPlatformConfig: PlatformAccessibilityConfig = {
  id: "instagram",
  name: "Instagram",
  shortDescription:
    "Review image alt text, captions, hashtags, emoji, and contrast before publishing to Instagram.",
  seoIntro:
    "Prepare Instagram alt text, accessible captions, readable hashtags, and graphic contrast before you post. Menu labels and controls may vary by device and app version.",
  guidanceVersion: "2026.10",
  imageDescriptionLimit: null,
  capabilities: {
    imageAltText: {
      status: "supported",
      label: "Alternative text on images",
      note: "Supported in many posting workflows; exact controls vary by device, post type, and app version.",
    },
    multipleImageAltText: {
      status: "varies",
      label: "Multiple images",
      note: "Review each meaningful image when publishing carousels.",
    },
    videoCaptions: {
      status: "supported",
      label: "Video captions",
      note: "Instagram has supported automatically generated captions for video; review for accuracy when publishing video.",
    },
    automaticCaptions: {
      status: "supported",
      label: "Automatic captions",
      note: "Auto-generated captions may need review; video analysis comes in Phase 6.",
    },
    manualCaptionUpload: {
      status: "varies",
      label: "Manual caption upload",
      note: "Varies by workflow.",
    },
  },
  publishingGuidance: [
    {
      id: "ig-alt",
      title: "Alt text",
      body: "When publishing, use Instagram's available alt-text or accessibility option to add or review the image description.",
    },
    {
      id: "ig-meaning",
      title: "Meaningful content",
      body: "Describe meaningful content, not only aesthetics. Include essential text shown in the graphic.",
    },
    {
      id: "ig-promo",
      title: "Promotional details",
      body: "Ensure dates, prices, and offers are not accessible only visually.",
    },
  ],
  checklist: [
    { id: "alt-text-prepared", label: "Alt text prepared", kind: "automated" },
    { id: "image-text-covered", label: "Image text covered", kind: "automated" },
    { id: "caption-context", label: "Caption gives sufficient context", kind: "automated" },
    { id: "hashtag-readability", label: "Hashtags readable", kind: "automated" },
    { id: "emoji-reviewed", label: "Emoji usage reviewed", kind: "automated" },
    { id: "fancy-unicode", label: "Decorative Unicode avoided", kind: "automated" },
    { id: "visual-contrast", label: "Contrast reviewed", kind: "automated" },
    {
      id: "offer-details",
      label: "Important dates/prices/offer details available outside image-only content",
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
      label: "Added/reviewed alt text on Instagram",
      kind: "publishing_task",
    },
    {
      id: "platform-final-review",
      label: "Final review before publishing",
      kind: "publishing_task",
    },
  ],
  helpSteps: [
    "Create your post and add your image.",
    "Before publishing, open Instagram's alt-text or accessibility option for the image.",
    "Paste or enter your prepared description and review it.",
    "Complete your caption and hashtags.",
    "Review the post in the composer before publishing.",
  ],
  faq: [
    {
      question: "Can I prepare Instagram alt text here?",
      answer: "Yes. This tool helps you draft and review alt text before you add it in Instagram.",
    },
    {
      question: "Does this tool publish to Instagram?",
      answer: "No. You copy prepared content and publish in the Instagram app or website.",
    },
    {
      question: "Does this guarantee ADA compliance?",
      answer: "No. It supports preflight review only.",
    },
    {
      question: "Can it analyze text inside my image?",
      answer:
        "Optional AI image review may detect visible text, but you should verify accuracy. Contrast tools measure colors you sample or enter.",
    },
  ],
  sourceMetadata: {
    lastReviewed: "2026-10-08",
    sourceLabels: ["Meta / Instagram Help Center", "Meta accessibility guidance"],
  },
};
