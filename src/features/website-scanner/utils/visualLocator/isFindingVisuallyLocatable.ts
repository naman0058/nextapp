/** Rules that typically lack a meaningful element target for highlighting. */
const DOCUMENT_LEVEL_RULE_IDS = new Set([
  "html-has-lang",
  "document-title",
  "bypass",
  "page-has-heading-one",
  "landmark-one-main",
]);

export function isRuleVisuallyLocatable(ruleId: string): boolean {
  if (DOCUMENT_LEVEL_RULE_IDS.has(ruleId)) return false;
  return true;
}

export function isNodeVisuallyLocatable(input: {
  ruleId: string;
  target: unknown;
  selectorLabel?: string;
}): boolean {
  if (!isRuleVisuallyLocatable(input.ruleId)) return false;
  if (input.target === null || input.target === undefined) return false;
  const label = input.selectorLabel?.trim() ?? "";
  if (!label || label === "html" || label === "body") {
    if (DOCUMENT_LEVEL_RULE_IDS.has(input.ruleId)) return false;
  }
  return true;
}
