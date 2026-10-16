export function sanitizeReportFilename(
  base: string,
  extension: "pdf" | "json" | "txt",
): string {
  const cleaned = base
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  const stem = cleaned || "accessibility-preflight-report";
  return `${stem}.${extension}`;
}

export function defaultReportFilenameParts(options: {
  platform?: string | null;
  client?: string;
  campaign?: string;
}): string {
  const parts = [
    "preflight-report",
    options.platform,
    options.client,
    options.campaign,
  ].filter(Boolean);
  return parts.join("-");
}
