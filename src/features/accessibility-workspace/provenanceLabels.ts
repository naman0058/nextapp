import type { ContributionProvenance } from "@/features/accessibility-workspace/types";

export function provenanceLabel(provenance: ContributionProvenance): string {
  switch (provenance) {
    case "automated_axe":
      return "Automated — axe";
    case "measured_tool":
      return "Measured — Contrast Checker";
    case "human_review":
      return "Human review";
    case "deterministic_guidance":
      return "Deterministic guidance";
    case "ai_assisted":
      return "AI-assisted — review before implementation";
    case "visual_evidence":
      return "Visual evidence";
    case "developer_handoff":
      return "Developer handoff";
    case "platform_guidance":
      return "Platform guidance";
    case "screen_reader_preview":
      return "Screen Reader Preview observation";
    default:
      return "Review evidence";
  }
}
