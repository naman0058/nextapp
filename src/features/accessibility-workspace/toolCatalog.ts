import type { WorkspaceToolId } from "@/features/accessibility-workspace/types";

export type ToolCapabilityFlags = {
  supportsContextualHandoff: boolean;
  supportsContribution: boolean;
  supportsReturnToFinding: boolean;
  supportsExplicitReportInclusion: boolean;
  supportsVerificationResult: boolean;
};

export type ToolCatalogEntry = {
  toolId: WorkspaceToolId;
  path: string;
  label: string;
  capabilities: ToolCapabilityFlags;
  contributionNote?: string;
};

export const WORKSPACE_TOOL_CATALOG: Record<WorkspaceToolId, ToolCatalogEntry> = {
  website_scanner: {
    toolId: "website_scanner",
    path: "/website-accessibility-scanner",
    label: "Website Scanner",
    capabilities: {
      supportsContextualHandoff: false,
      supportsContribution: true,
      supportsReturnToFinding: false,
      supportsExplicitReportInclusion: false,
      supportsVerificationResult: false,
    },
    contributionNote: "Core automated scan is always part of the workspace when present.",
  },
  contrast_checker: {
    toolId: "contrast_checker",
    path: "/image-contrast-checker",
    label: "Contrast Checker",
    capabilities: {
      supportsContextualHandoff: true,
      supportsContribution: true,
      supportsReturnToFinding: true,
      supportsExplicitReportInclusion: true,
      supportsVerificationResult: true,
    },
  },
  image_alt_checker: {
    toolId: "image_alt_checker",
    path: "/image-contrast-checker",
    label: "Image / Alt Text review",
    capabilities: {
      supportsContextualHandoff: true,
      supportsContribution: true,
      supportsReturnToFinding: true,
      supportsExplicitReportInclusion: true,
      supportsVerificationResult: false,
    },
    contributionNote:
      "Manual alt review for one scanner occurrence; upload your own image sample if needed.",
  },
  screen_reader_preview: {
    toolId: "screen_reader_preview",
    path: "/screen-reader-preview",
    label: "Screen Reader Preview",
    capabilities: {
      supportsContextualHandoff: true,
      supportsContribution: true,
      supportsReturnToFinding: true,
      supportsExplicitReportInclusion: true,
      supportsVerificationResult: false,
    },
  },
  video_accessibility: {
    toolId: "video_accessibility",
    path: "/video-accessibility-checker",
    label: "Video Accessibility Checker",
    capabilities: {
      supportsContextualHandoff: true,
      supportsContribution: true,
      supportsReturnToFinding: true,
      supportsExplicitReportInclusion: true,
      supportsVerificationResult: false,
    },
    contributionNote: "Applies to media you upload in the video tool, not automatic site-wide verification.",
  },
  social_accessibility: {
    toolId: "social_accessibility",
    path: "/social-media-accessibility-checker",
    label: "Social Accessibility Checker",
    capabilities: {
      supportsContextualHandoff: false,
      supportsContribution: false,
      supportsReturnToFinding: false,
      supportsExplicitReportInclusion: false,
      supportsVerificationResult: false,
    },
    contributionNote: "Standalone social content scope; not merged into website scanner reports.",
  },
  platform_guidance: {
    toolId: "platform_guidance",
    path: "/instagram-accessibility-checker",
    label: "Platform Guidance",
    capabilities: {
      supportsContextualHandoff: false,
      supportsContribution: false,
      supportsReturnToFinding: false,
      supportsExplicitReportInclusion: false,
      supportsVerificationResult: false,
    },
    contributionNote: "Publishing workflow guidance only; no website WCAG failure routing in Phase 6B.",
  },
  visual_issue_locator: {
    toolId: "visual_issue_locator",
    path: "/website-accessibility-scanner",
    label: "Visual Issue Locator",
    capabilities: {
      supportsContextualHandoff: false,
      supportsContribution: true,
      supportsReturnToFinding: false,
      supportsExplicitReportInclusion: true,
      supportsVerificationResult: false,
    },
    contributionNote: "Evidence references only; screenshots stay session-local.",
  },
  developer_ticket: {
    toolId: "developer_ticket",
    path: "/website-accessibility-scanner",
    label: "Developer Ticket",
    capabilities: {
      supportsContextualHandoff: false,
      supportsContribution: true,
      supportsReturnToFinding: false,
      supportsExplicitReportInclusion: true,
      supportsVerificationResult: false,
    },
  },
  ai_assisted_remediation: {
    toolId: "ai_assisted_remediation",
    path: "/website-accessibility-scanner",
    label: "AI-Assisted Remediation",
    capabilities: {
      supportsContextualHandoff: false,
      supportsContribution: true,
      supportsReturnToFinding: false,
      supportsExplicitReportInclusion: true,
      supportsVerificationResult: false,
    },
  },
};

export function toolPathForId(toolId: WorkspaceToolId): string {
  return WORKSPACE_TOOL_CATALOG[toolId].path;
}

export function toolCapabilities(toolId: WorkspaceToolId): ToolCapabilityFlags {
  return WORKSPACE_TOOL_CATALOG[toolId].capabilities;
}
