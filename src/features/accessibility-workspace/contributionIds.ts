/** Stable contribution IDs — same key replaces prior row (upsert policy). */

export function contrastContributionId(findingId: string, fg: string, bg: string): string {
  return `contrast-${findingId}-${fg.toLowerCase()}-${bg.toLowerCase()}`;
}

export function developerTicketContributionId(findingId: string): string {
  return `dev-ticket-${findingId}`;
}

export function visualLocatorContributionId(
  findingId: string,
  evidenceId: string,
  occurrenceIndex: number,
): string {
  return `visual-${findingId}-${evidenceId}-${occurrenceIndex}`;
}

export function imageAltContributionId(findingId: string): string {
  return `image-alt-${findingId}`;
}

export function screenReaderContributionId(findingId: string): string {
  return `sr-preview-${findingId}`;
}

export function videoWorkspaceContributionId(findingId: string): string {
  return `video-review-${findingId}`;
}
