export type BatchCsvRow = {
  sourceRow: number;
  id?: string;
  platform?: string;
  caption?: string;
  alt_text?: string;
  image_filename?: string;
  content_name?: string;
  client?: string;
  campaign?: string;
  notes?: string;
};

export type BatchImportError = {
  row: number;
  field: string;
  error: string;
  originalId?: string;
};

export type BatchImportWarning = {
  row: number;
  message: string;
};

export type BatchImportSummary = {
  rowsTotal: number;
  valid: number;
  needsReview: number;
  invalid: number;
  imagesMatched: number;
  imagesMissing: number;
  imagesAmbiguous: number;
};
