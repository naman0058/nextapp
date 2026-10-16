import { sanitizeCsvCellForSpreadsheet } from "@/features/batch/utils/export/sanitizeCsvCellForSpreadsheet";

/** Spreadsheet-safe string for CSV and Excel. */
export function sanitizeSpreadsheetCell(value: string): string {
  return sanitizeCsvCellForSpreadsheet(value);
}
