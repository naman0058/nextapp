export type ReportSettings = {
  includeContentText: boolean;
  includeAltText: boolean;
  includeImageThumbnail: boolean;
  includeAiFindings: boolean;
  includeDetailedFindings: boolean;
  includeHumanReviewChecklist: boolean;
  includeFullVideoTranscript: boolean;
  includeMethodology: boolean;
  includeInternalNotes: boolean;
  includeTechnicalDetails: boolean;
  includeAiRemediationAppendix: boolean;
};

export const DEFAULT_REPORT_SETTINGS: ReportSettings = {
  includeContentText: true,
  includeAltText: true,
  includeImageThumbnail: false,
  includeAiFindings: true,
  includeDetailedFindings: true,
  includeHumanReviewChecklist: true,
  includeFullVideoTranscript: false,
  includeMethodology: true,
  includeInternalNotes: false,
  includeTechnicalDetails: false,
  includeAiRemediationAppendix: false,
};

/** Max characters of full transcript allowed in PDF export */
export const MAX_TRANSCRIPT_CHARS_IN_PDF = 25_000;
