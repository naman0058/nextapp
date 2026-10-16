const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NUMERIC_ID_RE = /^\d{2,}$/;

const STATIC_SINGLE_SEGMENTS = new Set([
  "about",
  "contact",
  "pricing",
  "services",
  "blog",
  "news",
  "faq",
  "support",
  "login",
  "signup",
  "register",
  "privacy",
  "terms",
  "careers",
  "team",
]);

export function deriveUrlPattern(url: string): string {
  let pathname = "/";
  try {
    pathname = new URL(url).pathname || "/";
  } catch {
    return "/:unknown";
  }
  if (pathname === "/") return "/";
  const segments = pathname.split("/").filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const lower = seg.toLowerCase();
    if (
      i === segments.length - 1 &&
      segments.length > 1 &&
      !STATIC_SINGLE_SEGMENTS.has(lower) &&
      (/-/.test(seg) || NUMERIC_ID_RE.test(seg) || UUID_RE.test(seg))
    ) {
      out.push(":slug");
      continue;
    }
    if (i === segments.length - 1 && STATIC_SINGLE_SEGMENTS.has(lower)) {
      out.push(lower);
      continue;
    }
    if (UUID_RE.test(seg)) {
      out.push(":uuid");
      continue;
    }
    if (NUMERIC_ID_RE.test(seg)) {
      out.push(":id");
      continue;
    }
    if (/^\d{4}$/.test(seg) && segments[i + 1] && /^\d{1,2}$/.test(segments[i + 1]!)) {
      out.push(":year", ":month");
      i += 1;
      continue;
    }
    out.push(seg);
  }
  return `/${out.join("/")}`;
}
