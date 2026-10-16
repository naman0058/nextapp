import type {
  ContrastEvaluation,
  ContrastTextType,
  RGBColor,
} from "@/features/accessibility/types/visualAccessibility";
import {
  suggestAccessibleBackground,
  suggestAccessibleForeground,
} from "@/features/accessibility/utils/contrast/suggestAccessibleColor";
import { getRequiredRatio } from "@/features/accessibility/utils/contrast/evaluateContrast";
import type { RemediationFacts } from "@/lib/ai/remediation/types";
import { hashRemediationMaterial } from "@/lib/ai/remediation/adapters/remediationFingerprint";

export type BuildContrastRemediationContextInput = {
  foreground: RGBColor;
  background: RGBColor;
  foregroundHex: string;
  backgroundHex: string;
  textType: ContrastTextType;
  evaluation: ContrastEvaluation;
};

export type ContrastRemediationContext = {
  facts: RemediationFacts;
  deterministicGuidance: string[];
};

export function buildContrastRemediationContext(
  input: BuildContrastRemediationContextInput,
): ContrastRemediationContext {
  const { foreground, background, foregroundHex, backgroundHex, textType, evaluation } =
    input;
  const requiredThreshold = getRequiredRatio(textType);

  const fgSuggestion = suggestAccessibleForeground(
    foreground,
    background,
    requiredThreshold,
  );
  const bgSuggestion = suggestAccessibleBackground(
    foreground,
    background,
    requiredThreshold,
  );

  const issueFingerprint = hashRemediationMaterial("contrast:colors", [
    foregroundHex,
    backgroundHex,
    textType,
    evaluation.ratio,
  ]);

  const facts: RemediationFacts = {
    source: "contrast",
    issueFingerprint,
    foregroundHex,
    backgroundHex,
    textType,
    measuredRatio: evaluation.ratio,
    measuredRatioFormatted: evaluation.displayRatio,
    requiredThreshold,
    primaryVerdict: evaluation.primaryVerdict,
    primaryLabel: evaluation.primaryLabel,
    aaNormal: evaluation.aaNormal,
    aaLarge: evaluation.aaLarge,
    aaaNormal: evaluation.aaaNormal,
    aaaLarge: evaluation.aaaLarge,
    authoritative: true,
    doNotRecalculate: true,
    deterministicColorCandidates: {
      accessibleForegroundHex: fgSuggestion?.suggestedHex ?? null,
      accessibleBackgroundHex: bgSuggestion?.suggestedHex ?? null,
      foregroundRatio: fgSuggestion?.ratio ?? null,
      backgroundRatio: bgSuggestion?.ratio ?? null,
    },
  };

  const deterministicGuidance: string[] = [
    `Measured contrast ratio ${evaluation.displayRatio} is authoritative; do not change pass/fail or WCAG threshold in output.`,
    "AI may explain the issue and design considerations only.",
    "If suggesting colors, prefer deterministic safe candidates in facts.",
  ];

  return { facts, deterministicGuidance };
}
