export function sanitizeExportUrl(
  url: string,
  includeQueryStrings: boolean,
): string {
  try {
    const u = new URL(url);
    if (!includeQueryStrings) {
      u.search = "";
    }
    u.hash = "";
    return u.href;
  } catch {
    return url;
  }
}
