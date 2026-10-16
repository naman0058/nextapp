export function createBatchItemId(existing?: string): string {
  if (existing?.trim()) return existing.trim();
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `row-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `row-${Date.now().toString(36)}`;
}
