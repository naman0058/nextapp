import { sanitizeExportUrl } from "@/features/website-scanner/utils/export/sanitizeExportUrl";

export function pagePathFromUrl(url: string): string {
  try {
    const clean = sanitizeExportUrl(url, false);
    const u = new URL(clean);
    const path = u.pathname || "/";
    return path;
  } catch {
    return url.split("?")[0]?.split("#")[0] ?? url;
  }
}
