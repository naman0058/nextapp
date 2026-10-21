import type { RootCauseGroupType } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { LandmarkContext } from "@/features/website-scanner/types/scanTypes";

export function inferGroupType(
  landmark: LandmarkContext | undefined,
  tag?: string,
  role?: string,
): RootCauseGroupType {
  const lm = landmark ?? "unknown";
  if (lm === "navigation" || role === "navigation") return "shared_navigation";
  if (lm === "footer") return "shared_footer";
  if (lm === "form" || tag === "form") return "shared_form_component";
  if (tag === "button" || role === "button") return "shared_button_component";
  if (tag === "img" || role === "img") return "shared_image_component";
  if (lm === "header") return "shared_template";
  return "repeated_pattern";
}

export function buildGroupLabel(
  ruleId: string,
  groupType: RootCauseGroupType,
  help: string,
): string {
  const base = help || ruleId;
  switch (groupType) {
    case "shared_navigation":
      return `Likely shared navigation: ${base}`;
    case "shared_footer":
      return `Likely shared footer: ${base}`;
    case "shared_form_component":
      return `Likely shared form pattern: ${base}`;
    case "isolated":
      return `Isolated occurrence: ${base}`;
    case "rule_consolidated":
      return base;
    default:
      return `Repeated pattern: ${base}`;
  }
}
