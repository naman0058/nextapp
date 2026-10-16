import {
  MAX_AI_REMEDIATION_CONTEXT_CHARS,
  MAX_AI_REMEDIATION_SELECTORS,
  MAX_AI_REMEDIATION_SNIPPETS,
} from "@/lib/ai/remediation/constants";
import { AiRemediationError } from "@/lib/ai/remediation/errors";
import type { RemediationFacts } from "@/lib/ai/remediation/types";

function truncateString(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max);
}

function sanitizeStringArray(arr: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((s): s is string => typeof s === "string")
    .slice(0, maxItems)
    .map((s) => truncateString(s, maxLen));
}

/** Bound client-supplied facts before prompt assembly. */
export function sanitizeRemediationFacts(facts: RemediationFacts): RemediationFacts {
  const out: RemediationFacts = { ...facts };

  if (Array.isArray(facts.htmlSnippets)) {
    out.htmlSnippets = sanitizeStringArray(
      facts.htmlSnippets,
      MAX_AI_REMEDIATION_SNIPPETS,
      2_000,
    );
  }
  if (Array.isArray(facts.selectors)) {
    out.selectors = sanitizeStringArray(
      facts.selectors,
      MAX_AI_REMEDIATION_SELECTORS,
      500,
    );
  }
  if (typeof facts.caption === "string") {
    out.caption = truncateString(facts.caption, 4_000);
  }
  if (typeof facts.altText === "string") {
    out.altText = truncateString(facts.altText, 2_000);
  }
  if (typeof facts.transcriptExcerpt === "string") {
    out.transcriptExcerpt = truncateString(facts.transcriptExcerpt, 4_000);
  }

  for (const [key, value] of Object.entries(out)) {
    if (typeof value === "string" && value.length > 2_000) {
      out[key] = truncateString(value, 2_000);
    }
  }

  let serialized = JSON.stringify(out);
  if (serialized.length > MAX_AI_REMEDIATION_CONTEXT_CHARS) {
    out._truncated = true;
    if (Array.isArray(out.htmlSnippets)) {
      out.htmlSnippets = out.htmlSnippets.slice(0, 1);
    }
    serialized = JSON.stringify(out);
    if (serialized.length > MAX_AI_REMEDIATION_CONTEXT_CHARS) {
      throw new AiRemediationError(
        "AI_REMEDIATION_PAYLOAD_TOO_LARGE",
        "Remediation facts exceed allowed context size.",
      );
    }
  }

  return out;
}
