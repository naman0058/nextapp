function hostnameFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host.replace(/\./g, "-").replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
  } catch {
    return "scan-target";
  }
}

function dateStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "undated";
  return d.toISOString().slice(0, 10);
}

export function buildWebsiteReportFilename(
  rootUrl: string,
  generatedAt: string,
  kind: "pdf" | "json" | "xlsx",
): string {
  const host = hostnameFromUrl(rootUrl);
  const date = dateStamp(generatedAt);
  const ext = kind === "xlsx" ? "xlsx" : kind;
  if (kind === "xlsx") {
    return `digitalaccessready-${host}-evidence-${date}.${ext}`;
  }
  return `digitalaccessready-${host}-preflight-${date}.${ext}`;
}
