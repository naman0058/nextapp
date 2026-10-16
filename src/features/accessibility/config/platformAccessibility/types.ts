import type { SocialPlatform } from "@/types";

export type PlatformCapabilityStatus =
  | "supported"
  | "limited"
  | "varies"
  | "not_supported"
  | "unknown";

export type PlatformCapability = {
  status: PlatformCapabilityStatus;
  label: string;
  note?: string;
};

export type PlatformGuidanceItem = {
  id: string;
  title: string;
  body: string;
};

export type PlatformChecklistTemplateItem = {
  id: string;
  label: string;
  kind: "automated" | "publishing_task";
  videoPhase6?: boolean;
};

export type PlatformFaqItem = {
  question: string;
  answer: string;
};

export type PlatformAccessibilityConfig = {
  id: SocialPlatform;
  name: string;
  shortDescription: string;
  seoIntro: string;
  guidanceVersion: string;
  capabilities: {
    imageAltText: PlatformCapability;
    multipleImageAltText: PlatformCapability;
    videoCaptions: PlatformCapability;
    automaticCaptions: PlatformCapability;
    manualCaptionUpload: PlatformCapability;
  };
  imageDescriptionLimit: number | null;
  publishingGuidance: PlatformGuidanceItem[];
  checklist: PlatformChecklistTemplateItem[];
  helpSteps: string[];
  faq: PlatformFaqItem[];
  sourceMetadata: {
    lastReviewed: string;
    sourceLabels: string[];
    notes?: string;
  };
};

export type PlatformChecklistItemStatus =
  | "ready"
  | "review"
  | "not_applicable"
  | "not_checked";

export type PlatformChecklistResultItem = {
  id: string;
  label: string;
  kind: "automated" | "publishing_task";
  status: PlatformChecklistItemStatus;
  detail?: string;
};

export type PlatformPublishingReadinessLevel =
  | "ready_for_final_review"
  | "few_items_need_review"
  | "important_items_need_attention";

export type PlatformPublishingReadiness = {
  level: PlatformPublishingReadinessLevel;
  label: string;
  readyCount: number;
  reviewCount: number;
  notCheckedCount: number;
  notApplicableCount: number;
  totalApplicable: number;
};
