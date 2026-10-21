import type { FindingDetail } from "@/features/website-scanner/findingDetail/types";
import type { WorkspaceToolId } from "@/features/accessibility-workspace/types";
import { resolveToolIdFromHref } from "@/features/accessibility-workspace/resolveToolIdFromRoute";

const IMAGE_ALT_RULE =
  /^(image-alt|object-alt|svg-img-alt|input-image-alt|area-alt|role-img-alt|image-redundant-alt)$/i;

export function resolveToolIdForHandoff(
  detail: FindingDetail,
  href: string,
): WorkspaceToolId | null {
  if (IMAGE_ALT_RULE.test(detail.ruleId)) return "image_alt_checker";
  return resolveToolIdFromHref(href);
}
