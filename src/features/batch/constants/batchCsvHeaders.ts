export const BATCH_CSV_HEADERS = [
  "id",
  "platform",
  "caption",
  "alt_text",
  "image_filename",
  "content_name",
  "client",
  "campaign",
  "notes",
] as const;

export type BatchCsvHeader = (typeof BATCH_CSV_HEADERS)[number];
