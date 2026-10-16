import type { PreflightStatus } from "@/types";

/** Shared shell for in-tool result blocks */
export const resultPanelClass =
  "rounded-3xl border border-border bg-white p-5 shadow-sm";
import type { PlatformChecklistResultItem } from "@/features/accessibility/config/platformAccessibility/types";

export function preflightStatusAccent(status: PreflightStatus): string {
  switch (status) {
    case "pass":
      return "border-l-teal-500 bg-teal-50/40";
    case "review":
      return "border-l-amber-500 bg-amber-50/40";
    case "fail":
      return "border-l-rose-500 bg-rose-50/40";
    default:
      return "border-l-slate-300 bg-slate-50/50";
  }
}

export function platformItemAccent(
  status: PlatformChecklistResultItem["status"],
): string {
  switch (status) {
    case "ready":
      return "border-l-teal-500";
    case "review":
      return "border-l-amber-500";
    case "not_applicable":
      return "border-l-slate-300 opacity-80";
    default:
      return "border-l-indigo-300";
  }
}

export function platformStatusLabel(
  status: PlatformChecklistResultItem["status"],
): string {
  switch (status) {
    case "ready":
      return "Ready";
    case "review":
      return "Needs review";
    case "not_applicable":
      return "N/A";
    default:
      return "Not checked";
  }
}
