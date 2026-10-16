import Papa from "papaparse";
import { MAX_BATCH_ROWS } from "@/features/batch/constants/batchLimits";
import type { BatchCsvRow } from "@/features/batch/types/batchImport";

export type ParseBatchCsvResult =
  | { ok: true; rows: BatchCsvRow[] }
  | { ok: false; error: string };

function isEmptyRow(row: Record<string, string>): boolean {
  return Object.values(row).every((v) => !String(v ?? "").trim());
}

export function parseBatchCsv(text: string): ParseBatchCsvResult {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: false,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (parsed.errors.length > 0) {
    const first = parsed.errors[0];
    return {
      ok: false,
      error: first.message ?? "CSV could not be parsed.",
    };
  }

  const rows: BatchCsvRow[] = [];
  for (let i = 0; i < parsed.data.length; i++) {
    const record = parsed.data[i];
    if (!record || isEmptyRow(record)) continue;
    rows.push({
      sourceRow: i + 2,
      id: record.id?.trim() || undefined,
      platform: record.platform?.trim() || undefined,
      caption: record.caption ?? "",
      alt_text: record.alt_text?.trim() || undefined,
      image_filename: record.image_filename?.trim() || undefined,
      content_name: record.content_name?.trim() || undefined,
      client: record.client?.trim() || undefined,
      campaign: record.campaign?.trim() || undefined,
      notes: record.notes?.trim() || undefined,
    });
  }

  if (rows.length > MAX_BATCH_ROWS) {
    return {
      ok: false,
      error: `This file has ${rows.length} data rows. The maximum is ${MAX_BATCH_ROWS}. Remove rows or split into multiple batches.`,
    };
  }

  if (rows.length === 0) {
    return { ok: false, error: "No data rows found in CSV." };
  }

  return { ok: true, rows };
}
