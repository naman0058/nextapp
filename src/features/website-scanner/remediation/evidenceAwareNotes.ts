import type { DeterministicRemediationDefinition } from "@/features/website-scanner/remediation/types";

function snippetLooksLikeIconButton(html: string): boolean {
  return /<button\b/i.test(html) && /<svg|icon/i.test(html) && !/>[^<\s]+</.test(html);
}

function snippetMissingLang(html: string): boolean {
  return /<html\b(?![^>]*\blang=)/i.test(html);
}

function extractDuplicateId(html: string): string | undefined {
  const m = /\bid\s*=\s*["']([^"']+)["']/i.exec(html);
  return m?.[1];
}

export function buildEvidenceAwareNotes(
  def: DeterministicRemediationDefinition,
  sanitizedSnippets: string[],
): string[] {
  const notes: string[] = [];
  const joined = sanitizedSnippets.join("\n");

  if (def.ruleId === "button-name" && sanitizedSnippets.some(snippetLooksLikeIconButton)) {
    notes.push(
      "Evidence shows a button that likely lacks visible text—provide an accessible name (visible label or aria-label) without guessing the product-specific wording.",
    );
  }

  if (def.ruleId === "html-has-lang" && sanitizedSnippets.some(snippetMissingLang)) {
    notes.push("Evidence indicates the root document is missing a lang attribute on <html>.");
  }

  if (
    (def.ruleId === "duplicate-id" || def.ruleId === "duplicate-id-aria") &&
    sanitizedSnippets.length
  ) {
    const id = extractDuplicateId(sanitizedSnippets[0] ?? "");
    if (id) {
      notes.push(
        `Evidence references id="${id}"—ensure this value is unique in the document and in ARIA relationships.`,
      );
    }
  }

  if (def.ruleId === "color-contrast" && joined.includes("contrast")) {
    notes.push(
      "Use measured foreground/background values from the failure summary when present; adjust colors and re-measure rather than guessing.",
    );
  }

  if (def.requiresHumanJudgment) {
    notes.push(
      "Human review is required to confirm the semantic choice (automation cannot verify meaning).",
    );
  }

  return notes;
}
