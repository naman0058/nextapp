import type { PlatformAccessibilityConfig } from "@/features/accessibility/config/platformAccessibility/types";
import { coreImageChecklist } from "@/features/accessibility/config/platformAccessibility/sharedChecklist";

export const xPlatformConfig: PlatformAccessibilityConfig = {
  id: "x",
  name: "X",
  shortDescription:
    "Review image descriptions, captions, hashtags, and visual accessibility before publishing to X.",
  seoIntro:
    "Prepare X image descriptions (up to the documented 1,000-character limit), readable hashtags, and accessible captions before you post. This preflight runs locally and does not publish to X.",
  guidanceVersion: "2026.10",
  imageDescriptionLimit: 1000,
  capabilities: {
    imageAltText: {
      status: "supported",
      label: "Author-supplied image descriptions",
      note: "Image descriptions can be added to individual images on web, iOS, and Android.",
    },
    multipleImageAltText: {
      status: "supported",
      label: "Per-image descriptions",
      note: "Add a description to each meaningful image when posting multiple images.",
    },
    videoCaptions: {
      status: "varies",
      label: "Video captions",
      note: "Caption options vary by media and post workflow. Video analysis is planned for Phase 6.",
    },
    automaticCaptions: {
      status: "varies",
      label: "Automatic captions",
      note: "Availability varies; review captions in X when publishing video.",
    },
    manualCaptionUpload: {
      status: "varies",
      label: "Manual caption upload",
      note: "Varies by workflow; not analyzed in this phase.",
    },
  },
  publishingGuidance: [
    {
      id: "x-concise-alt",
      title: "Concise descriptions",
      body: "X accessibility guidance recommends concise, descriptive image descriptions in regular sentence casing.",
    },
    {
      id: "x-hashtags",
      title: "Hashtags",
      body: "Consider capitalizing word boundaries in multi-word hashtags for readability.",
    },
    {
      id: "x-emoji",
      title: "Emoji",
      body: "Avoid excessive repeated emoji, which may add listening time for some assistive technologies.",
    },
    {
      id: "x-multi-image",
      title: "Multiple images",
      body: "If your post contains multiple images, add a useful image description to each meaningful image when publishing.",
    },
  ],
  checklist: [
    ...coreImageChecklist(),
    {
      id: "x-alt-limit",
      label: "Image description within X documented limit (1,000 characters)",
      kind: "automated",
    },
    {
      id: "all-images-reviewed",
      label: "All images reviewed individually (when posting multiple)",
      kind: "publishing_task",
    },
  ],
  helpSteps: [
    "Upload image in the post composer.",
    "Open the image description / ALT option.",
    "Paste and review your prepared description.",
    "Repeat for each meaningful image.",
    "Review the final post before publishing.",
  ],
  faq: [
    {
      question: "How long can an X image description be?",
      answer:
        "X currently documents a 1,000-character limit for image descriptions. Shorter, purposeful descriptions are usually easier to consume.",
    },
    {
      question: "Should each image have its own description?",
      answer:
        "When posting multiple meaningful images, prepare and add a description for each image in X.",
    },
    {
      question: "Does this tool publish to X?",
      answer: "No. Copy your caption and description and apply them in X when posting.",
    },
    {
      question: "Does this guarantee ADA or WCAG compliance?",
      answer:
        "No. This tool provides preflight guidance only and does not certify legal or standards compliance.",
    },
  ],
  sourceMetadata: {
    lastReviewed: "2026-10-08",
    sourceLabels: ["X Help Center", "X accessibility guidance"],
  },
};
