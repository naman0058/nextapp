import type { ReportMethodology } from "@/features/reports/types/reportModel";
import { METHODOLOGY_VERSION } from "@/features/reports/constants/reportVersion";

export const REPORT_METHODOLOGY: ReportMethodology = {
  version: METHODOLOGY_VERSION,
  categories: [
    {
      type: "rule",
      label: "Rule-based checks",
      examples: [
        "Caption readability and hashtag patterns",
        "Alt text presence and duplication",
        "Caption quality heuristics for video",
      ],
    },
    {
      type: "measurement",
      label: "Measured checks",
      examples: ["WCAG contrast ratio from sampled colors"],
    },
    {
      type: "ai",
      label: "AI-assisted review",
      examples: [
        "Optional image description suggestions",
        "Sampled video frame observations",
      ],
    },
    {
      type: "ai_guidance",
      label: "AI-assisted remediation (optional appendix)",
      examples: [
        "Explicitly generated fix guidance — requires review before implementation",
        "Not included in exports unless selected",
      ],
    },
    {
      type: "human",
      label: "Human confirmation",
      examples: [
        "Platform publishing confirmations",
        "Visual design checklist",
        "Transcript accuracy sign-off",
      ],
    },
  ],
};
