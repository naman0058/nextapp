const MARKDOWN_LINK = /\[([^\]]*)\]\(([^)]+)\)/g;

function isInternalHref(href: string, siteHost: string): boolean {
  const trimmed = href.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }
    return url.hostname === siteHost || url.hostname.endsWith(`.${siteHost}`);
  } catch {
    return false;
  }
}

export function countInternalLinksInMarkdown(
  content: string,
  siteHost: string,
): number {
  const host = siteHost.replace(/^www\./, "");
  let count = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(MARKDOWN_LINK.source, "g");
  while ((match = re.exec(content)) !== null) {
    const href = match[2]?.trim() ?? "";
    if (isInternalHref(href, host)) {
      count += 1;
    }
  }
  return count;
}
