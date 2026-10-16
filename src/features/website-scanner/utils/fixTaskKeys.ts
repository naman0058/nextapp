export function fixTaskKeyForRootCause(rootCauseGroupId: string): string {
  return rootCauseGroupId;
}

export function fixTaskKeyForRulePage(ruleId: string, pageUrl: string): string {
  return `${ruleId}::${pageUrl}`;
}
