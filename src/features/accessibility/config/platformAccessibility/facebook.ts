import type { PlatformAccessibilityConfig } from "@/features/accessibility/config/platformAccessibility/types";
export const facebookPlatformConfig: PlatformAccessibilityConfig = {
  id: "facebook",
  name: "Facebook",
  shortDescription:
    "Review Facebook photo alternative text, captions, and visual accessibility before publishing.",
  seoIntro:
    "Prepare meaningful alternative text and accessible captions for Facebook photo posts. Controls and labels may vary by device and current Meta interface.",
  guidanceVersion: "2026.10",
  imageDescriptionLimit: null,
  capabilities: {
    imageAltText: {
      status: "supported",
      label: "Alternative text for photos",
      note: "Users can edit or add alternative text in supported photo workflows.",
    },
    multipleImageAltText: {
      status: "varies",
      label: "Multiple photos",
      note: "Review each meaningful image in multi-photo posts.",
    },
    videoCaptions: {
      status: "supported",
      label: "Video captions",
      note: "Caption files such as SRT are supported in some video workflows.",
    },
    automaticCaptions: {
      status: "supported",
      label: "Automatic alt text",
      note: "Facebook may generate alternative text; review when author context matters.",
    },
    manualCaptionUpload: {
      status: "varies",
      label: "Manual caption upload",
      note: "Varies by video workflow.",
    },
  },
  publishingGuidance: [
    {
      id: "fb-alt",
      title: "Alternative text",
      body: "Review or provide meaningful alternative text. Do not rely only on automatically generated descriptions when your context matters.",
    },
    {
      id: "fb-events",
      title: "Events and offers",
      body: "Include important event, date, and offer information accessibly in caption or alt text as appropriate.",
    },
    {
      id: "fb-cta",
      title: "Calls to action",
      body: "Avoid image-only calls to action; provide context in the post caption.",
    },
  ],
  checklist: [
    { id: "alt-text-prepared", label: "Meaningful image description prepared", kind: "automated" },
    { id: "image-text-covered", label: "Important embedded text reviewed", kind: "automated" },
    { id: "caption-context", label: "Post caption gives context", kind: "automated" },
    { id: "visual-contrast", label: "Color contrast reviewed", kind: "automated" },
    { id: "emoji-reviewed", label: "Emoji/punctuation reviewed", kind: "automated" },
    { id: "hashtag-readability", label: "Hashtag readability reviewed", kind: "automated" },
    { id: "link-wording", label: "Links have meaningful context", kind: "automated" },
    {
      id: "video-captions",
      label: "Video captions reviewed",
      kind: "automated",
      videoPhase6: true,
    },
    {
      id: "platform-alt-added",
      label: "Added/reviewed alt text on Facebook",
      kind: "publishing_task",
    },
    {
      id: "platform-final-review",
      label: "Final review before publishing",
      kind: "publishing_task",
    },
  ],
  helpSteps: [
    "Add your photo to a post.",
    "Open the photo's alternative text or accessibility option when available.",
    "Enter or review your prepared description.",
    "Write a caption with useful context.",
    "Review before publishing.",
  ],
  faq: [
    {
      question: "Does Facebook support alternative text?",
      answer:
        "Facebook supports alternative text for photos in many workflows, and may also generate automatic descriptions.",
    },
    {
      question: "Should I review automatically generated descriptions?",
      answer:
        "Yes when the image communicates information that automation may miss or misstate.",
    },
    {
      question: "Does this publish to Facebook?",
      answer: "No. Copy your content into Facebook when posting.",
    },
  ],
  sourceMetadata: {
    lastReviewed: "2026-10-08",
    sourceLabels: ["Meta / Facebook Help Center"],
  },
};
