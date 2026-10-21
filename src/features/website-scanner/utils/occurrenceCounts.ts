import type { RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";

export function formatAffectedOccurrencesSummary(
  totalAffectedOccurrences: number,
  affectedPageCount: number,
): string {
  const pageLabel = affectedPageCount === 1 ? "page" : "pages";
  return `${totalAffectedOccurrences} affected occurrence${totalAffectedOccurrences === 1 ? "" : "s"} on ${affectedPageCount} ${pageLabel}`;
}

export function formatRetainedEvidenceNote(
  retainedEvidenceCount: number,
  totalAffectedOccurrences: number,
): string | null {
  if (retainedEvidenceCount >= totalAffectedOccurrences) return null;
  return formatDetailedEvidenceExamples(retainedEvidenceCount);
}

export function formatDetailedEvidenceExamples(retainedEvidenceCount: number): string {
  return `${retainedEvidenceCount} detailed evidence example${retainedEvidenceCount === 1 ? "" : "s"} retained`;
}

export function formatRepresentativeSelectorsShown(displayedSelectorCount: number): string {
  return `Showing ${displayedSelectorCount} representative selector${displayedSelectorCount === 1 ? "" : "s"}`;
}

export function viewOccurrencesButtonLabel(
  retainedEvidenceCount: number,
  totalAffectedOccurrences: number,
): string {
  if (retainedEvidenceCount >= totalAffectedOccurrences) {
    return `View all occurrences (${totalAffectedOccurrences})`;
  }
  return `View retained evidence (${retainedEvidenceCount} of ${totalAffectedOccurrences})`;
}

export function groupOccurrenceMetrics(group: RootCauseGroup): {
  totalAffectedOccurrences: number;
  retainedEvidenceCount: number;
  displayedSelectorExampleCount: number;
} {
  return {
    totalAffectedOccurrences: group.totalOccurrences,
    retainedEvidenceCount: group.retainedEvidenceCount,
    displayedSelectorExampleCount: group.representativeSelectors.length,
  };
}
