import { sanitizeExportUrl } from "@/features/website-scanner/utils/export/sanitizeExportUrl";
import { pagePathFromUrl } from "@/features/website-scanner/developerTicket/pagePathFromUrl";

const MAX_SELECTOR = 512;
const MAX_ALT = 500;
const MAX_NOTE = 2000;

export function sanitizeHandoffSelector(selector: string | undefined): string | undefined {
  if (!selector) return undefined;
  const trimmed = selector.trim().slice(0, MAX_SELECTOR);
  return trimmed || undefined;
}

export function sanitizeHandoffPageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return sanitizeExportUrl(url, false);
  } catch {
    return undefined;
  }
}

export function sanitizeHandoffPageOrigin(url: string | undefined): string | undefined {
  const clean = sanitizeHandoffPageUrl(url);
  if (!clean) return undefined;
  try {
    return new URL(clean).origin;
  } catch {
    return undefined;
  }
}

export function sanitizeHandoffPath(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return pagePathFromUrl(sanitizeHandoffPageUrl(url) ?? url);
}

export function sanitizeHandoffAltText(alt: string | undefined): string | undefined {
  if (!alt) return undefined;
  const trimmed = alt.replace(/\s+/g, " ").trim().slice(0, MAX_ALT);
  return trimmed || undefined;
}

export function sanitizeHandoffUserNote(note: string | undefined): string | undefined {
  if (!note) return undefined;
  return note.trim().slice(0, MAX_NOTE) || undefined;
}
