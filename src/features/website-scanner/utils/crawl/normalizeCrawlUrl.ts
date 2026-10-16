const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
];

const SKIP_EXTENSIONS =
  /\.(pdf|zip|rar|7z|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png|webp|gif|svg|mp4|webm|mp3|wav)(\?|$)/i;

const ACTION_PATH =
  /\/(logout|signout|sign-out|delete|remove|unsubscribe|checkout|purchase|confirm-order|admin)(\/|$)/i;

export function normalizeCrawlKey(url: URL): string {
  const copy = new URL(url.href);
  copy.hash = "";
  for (const p of TRACKING_PARAMS) {
    copy.searchParams.delete(p);
  }
  if ([...copy.searchParams.keys()].length === 0) {
    copy.search = "";
  }
  let path = copy.pathname;
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  copy.pathname = path;
  return copy.href;
}

export function shouldSkipCrawlHref(href: string, base: URL): boolean {
  const lower = href.trim().toLowerCase();
  if (
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:") ||
    lower.startsWith("sms:") ||
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("file:") ||
    lower.startsWith("blob:")
  ) {
    return true;
  }
  let resolved: URL;
  try {
    resolved = new URL(href, base);
  } catch {
    return true;
  }
  if (resolved.origin !== base.origin) return true;
  if (SKIP_EXTENSIONS.test(resolved.pathname)) return true;
  if (ACTION_PATH.test(resolved.pathname)) return true;
  return false;
}
