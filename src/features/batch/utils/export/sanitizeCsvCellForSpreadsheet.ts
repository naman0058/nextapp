const FORMULA_LEAD = /^[\s\uFEFF]*[=+\-@]/;

/** Prevent spreadsheet formula injection in exported CSV/Excel cells. */
export function sanitizeCsvCellForSpreadsheet(value: string): string {
  if (!value) return value;
  if (FORMULA_LEAD.test(value)) {
    return `\t${value.trimStart()}`;
  }
  const first = value[0];
  if (first === "\t" || first === "\r" || first === "\n") {
    return `\t${value}`;
  }
  return value;
}
