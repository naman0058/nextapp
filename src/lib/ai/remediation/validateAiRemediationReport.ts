import {
  AI_REMEDIATION_REPORT_VERSION,
  MAX_ALTERNATIVES,
  MAX_ARRAY_ITEMS,
  MAX_SUGGESTED_CODE_LINES,
  MAX_STRING_FIELD_CHARS,
} from "@/lib/ai/remediation/constants";
import type {
  AIRemediationReport,
  RemediationAlternative,
  RemediationSource,
  SuggestedCodeBlock,
} from "@/lib/ai/remediation/types";

const SOURCES: RemediationSource[] = [
  "website",
  "social",
  "image",
  "contrast",
  "video",
  "batch",
];

function isNonEmptyString(value: unknown, maxLen: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLen;
}

function stringArray(value: unknown, maxItems: number): value is string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > maxItems) {
    return false;
  }
  return value.every(
    (item) =>
      typeof item === "string" &&
      item.trim().length > 0 &&
      item.length <= MAX_STRING_FIELD_CHARS,
  );
}

function parseSuggestedCode(value: unknown): SuggestedCodeBlock | null | undefined {
  if (value === null || value === undefined) return value;
  if (typeof value !== "object" || value === null) return undefined;
  const o = value as Record<string, unknown>;
  if (
    !isNonEmptyString(o.language, 40) ||
    typeof o.code !== "string" ||
    typeof o.explanation !== "string"
  ) {
    return undefined;
  }
  const lines = o.code.split("\n").length;
  if (lines > MAX_SUGGESTED_CODE_LINES || o.code.length > MAX_STRING_FIELD_CHARS * 3) {
    return undefined;
  }
  return {
    language: o.language.trim(),
    code: o.code,
    explanation: o.explanation.slice(0, MAX_STRING_FIELD_CHARS),
  };
}

function parseAlternatives(value: unknown): RemediationAlternative[] | undefined {
  if (!Array.isArray(value) || value.length > MAX_ALTERNATIVES) return undefined;
  const out: RemediationAlternative[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) return undefined;
    const o = item as Record<string, unknown>;
    if (!isNonEmptyString(o.label, 200) || !isNonEmptyString(o.explanation, MAX_STRING_FIELD_CHARS)) {
      return undefined;
    }
    out.push({
      label: o.label.trim(),
      explanation: o.explanation.trim(),
      code: typeof o.code === "string" ? o.code.slice(0, MAX_STRING_FIELD_CHARS) : null,
      content:
        typeof o.content === "string" ? o.content.slice(0, MAX_STRING_FIELD_CHARS) : null,
    });
  }
  return out;
}

export function validateAiRemediationReport(
  parsed: unknown,
  expectedSource: RemediationSource,
): { ok: true; data: AIRemediationReport } | { ok: false } {
  if (typeof parsed !== "object" || parsed === null) return { ok: false };
  const o = parsed as Record<string, unknown>;

  if (typeof o.version !== "string" || o.version.length > 20) return { ok: false };
  if (typeof o.source !== "string" || !SOURCES.includes(o.source as RemediationSource)) {
    return { ok: false };
  }
  if (o.source !== expectedSource) return { ok: false };

  if (!isNonEmptyString(o.title, 300)) return { ok: false };
  if (!isNonEmptyString(o.problemSummary, MAX_STRING_FIELD_CHARS)) return { ok: false };
  if (!isNonEmptyString(o.whyItMatters, MAX_STRING_FIELD_CHARS)) return { ok: false };

  if (!stringArray(o.recommendedApproach, MAX_ARRAY_ITEMS)) return { ok: false };
  if (!stringArray(o.mistakesToAvoid, MAX_ARRAY_ITEMS)) return { ok: false };
  if (!stringArray(o.acceptanceCriteria, MAX_ARRAY_ITEMS)) return { ok: false };
  if (!stringArray(o.verificationSteps, MAX_ARRAY_ITEMS)) return { ok: false };
  if (!stringArray(o.humanReview, MAX_ARRAY_ITEMS)) return { ok: false };
  if (!stringArray(o.assumptions, MAX_ARRAY_ITEMS)) return { ok: false };
  if (!stringArray(o.limitations, MAX_ARRAY_ITEMS)) return { ok: false };

  const suggestedCode = parseSuggestedCode(o.suggestedCode);
  if (o.suggestedCode !== undefined && o.suggestedCode !== null && suggestedCode === undefined) {
    return { ok: false };
  }

  let suggestedContent: string | null | undefined = undefined;
  if (o.suggestedContent === null) suggestedContent = null;
  else if (typeof o.suggestedContent === "string") {
    suggestedContent = o.suggestedContent.slice(0, MAX_STRING_FIELD_CHARS);
  } else if (o.suggestedContent !== undefined) return { ok: false };

  const alternatives = parseAlternatives(o.alternatives);
  if (!alternatives) return { ok: false };

  let confidenceNote: string | null | undefined = undefined;
  if (o.confidenceNote === null) confidenceNote = null;
  else if (typeof o.confidenceNote === "string") {
    if (/\d+\s*%/.test(o.confidenceNote)) return { ok: false };
    confidenceNote = o.confidenceNote.slice(0, MAX_STRING_FIELD_CHARS);
  } else if (o.confidenceNote !== undefined) return { ok: false };

  const report: AIRemediationReport = {
    version: AI_REMEDIATION_REPORT_VERSION,
    source: expectedSource,
    title: o.title.trim(),
    problemSummary: o.problemSummary.trim(),
    whyItMatters: o.whyItMatters.trim(),
    recommendedApproach: o.recommendedApproach as string[],
    suggestedCode: suggestedCode ?? null,
    suggestedContent: suggestedContent ?? null,
    alternatives,
    mistakesToAvoid: o.mistakesToAvoid as string[],
    acceptanceCriteria: o.acceptanceCriteria as string[],
    verificationSteps: o.verificationSteps as string[],
    humanReview: o.humanReview as string[],
    assumptions: o.assumptions as string[],
    limitations: o.limitations as string[],
    confidenceNote: confidenceNote ?? null,
  };

  return { ok: true, data: report };
}
