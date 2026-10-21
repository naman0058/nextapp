import type { RemediationAction } from "@/features/website-scanner/remediation/types";
import { getDeterministicRemediation } from "@/features/website-scanner/remediation/registry";

const IMAGE_ALT_RULES =
  /^(image-alt|object-alt|svg-img-alt|input-image-alt|area-alt|role-img-alt|image-redundant-alt)$/i;

export function remediationActionsForRule(input: {
  ruleId: string;
  visualLocatorAvailable?: boolean;
  developerTicketAvailable?: boolean;
}): RemediationAction[] {
  const actions: RemediationAction[] = [];
  const def = getDeterministicRemediation(input.ruleId);

  if (def?.specializedTool) {
    actions.push({
      kind: "specialized_tool",
      href: def.specializedTool.href,
      label: def.specializedTool.label,
    });
  } else if (/color-contrast|non-text-contrast|link-in-text-block/i.test(input.ruleId)) {
    actions.push({
      kind: "specialized_tool",
      href: "/image-contrast-checker",
      label: "Contrast checker",
    });
  } else if (IMAGE_ALT_RULES.test(input.ruleId)) {
    actions.push({
      kind: "specialized_tool",
      href: "/image-contrast-checker",
      label: "Image / alt text tools",
    });
  } else if (/heading-order|empty-heading|landmark|region|bypass|skip-link|p-as-heading/i.test(input.ruleId)) {
    actions.push({
      kind: "specialized_tool",
      href: "/screen-reader-preview",
      label: "Screen reader preview",
    });
  } else if (/video-caption|audio-caption|video-description|no-autoplay-audio/i.test(input.ruleId)) {
    actions.push({
      kind: "specialized_tool",
      href: "/video-accessibility-checker",
      label: "Video accessibility checker",
    });
  }

  if (input.visualLocatorAvailable) {
    actions.push({
      kind: "visual_locator",
      label: "View on Page",
      description: "Open visual issue locator for supported evidence.",
    });
  }

  if (input.developerTicketAvailable !== false) {
    actions.push({
      kind: "developer_ticket",
      label: "Copy Developer Ticket",
    });
  }

  return actions;
}
