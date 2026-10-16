import type { RemediationSource } from "@/lib/ai/remediation/types";

export const AI_REMEDIATION_BUTTON_LABEL = "Generate AI-Assisted Remediation";

export const AI_REMEDIATION_DISCLOSURE =
  "Optional AI assistance: bounded issue evidence (not a full webpage) is sent to OpenAI when you choose to generate guidance. Review suggestions before implementation. Provider retention follows your OpenAI account settings.";

export const AI_REMEDIATION_REVIEW_NOTE =
  "Suggested Implementation — Review Before Implementation. Verification Required.";

const SOURCE_BUTTON_LABELS: Partial<Record<RemediationSource, string>> = {
  social: "Generate Accessible Revision",
  image: "Generate Improved Alt Options",
  contrast: "Explain & Refine Fix",
  video: "Suggested Caption Revision",
  batch: "Generate AI Remediation",
};

const SOURCE_DISCLOSURE: Partial<Record<RemediationSource, string>> = {
  social:
    "Optional: caption, platform context, and deterministic findings are sent to OpenAI when you generate a revision. Original caption is preserved until you apply a suggestion.",
  image:
    "Optional: alt text, caption, and existing image analysis from this session (if any) are sent to OpenAI. No new image upload occurs for remediation.",
  contrast:
    "Optional: measured colors and contrast results from this tool are sent for design guidance only. Pass/fail and ratios remain deterministic.",
  video:
    "Optional: the selected caption cue and nearby transcript context are sent to OpenAI. Full video is not sent.",
  batch:
    "Optional: selected row content and analysis summaries are sent per item when you run batch remediation.",
};

export function buttonLabelForSource(source: RemediationSource): string | undefined {
  return SOURCE_BUTTON_LABELS[source];
}

export function disclosureForSource(source: RemediationSource): string | undefined {
  return SOURCE_DISCLOSURE[source];
}
