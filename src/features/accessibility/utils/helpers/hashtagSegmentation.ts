const SKIP_AUTO_FIX = new Set([
  "ai",
  "seo",
  "usa",
  "ios",
  "api",
  "ux",
  "ui",
  "tv",
  "hr",
  "pr",
  "vr",
  "ar",
  "id",
]);

const COMMON_WORDS = new Set([
  "digital",
  "marketing",
  "community",
  "workshop",
  "black",
  "friday",
  "fridays",
  "blackfriday",
  "sale",
  "biggest",
  "starts",
  "today",
  "social",
  "media",
  "accessibility",
  "content",
  "product",
  "launch",
  "event",
  "registration",
  "online",
  "business",
  "health",
  "care",
  "technology",
  "education",
  "university",
  "student",
  "team",
  "news",
  "update",
  "world",
  "day",
  "week",
  "month",
  "year",
  "new",
  "york",
  "los",
  "angeles",
  "san",
  "francisco",
]);

export type HashtagSuggestion = {
  original: string;
  suggested: string;
  confident: boolean;
};

function toPascalCase(words: string[]): string {
  const body = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  return body;
}

function segmentHashtag(tag: string): string[] | null {
  const body = tag.slice(1).toLowerCase();
  if (body.length < 4) return null;
  if (SKIP_AUTO_FIX.has(body)) return null;
  if (/[A-Z]/.test(tag.slice(1))) return null;

  const words: string[] = [];
  let remaining = body;
  let guard = 0;

  while (remaining.length > 0 && guard < 20) {
    guard++;
    let matched: string | null = null;
    for (let len = Math.min(remaining.length, 15); len >= 3; len--) {
      const candidate = remaining.slice(0, len);
      if (COMMON_WORDS.has(candidate)) {
        matched = candidate;
        remaining = remaining.slice(len);
        break;
      }
    }
    if (!matched) return null;
    words.push(matched);
  }

  if (remaining.length > 0 || words.length < 2) return null;
  return words;
}

export function suggestHashtagReadability(tag: string): HashtagSuggestion | null {
  if (!tag.startsWith("#")) return null;
  const body = tag.slice(1);
  if (body.length < 5) return null;
  if (/[A-Z]/.test(body.slice(1))) return null;

  const lower = body.toLowerCase();
  if (SKIP_AUTO_FIX.has(lower)) return null;

  const words = segmentHashtag(tag);
  if (!words) {
    return {
      original: tag,
      suggested: tag,
      confident: false,
    };
  }

  const pascal = `#${toPascalCase(words)}`;
  return {
    original: tag,
    suggested: pascal,
    confident: pascal !== tag,
  };
}

export function applyHashtagCamelCase(
  caption: string,
  hashtag: string,
  suggested: string,
): string {
  const regex = new RegExp(
    hashtag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "g",
  );
  return caption.replace(regex, suggested);
}
