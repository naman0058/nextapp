export function humanReviewRecordId(
  checkDefinitionId: string,
  scopeKey = "site",
): string {
  return `hr-${checkDefinitionId}-${scopeKey}`;
}
