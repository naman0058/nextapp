const KNOWN_ACRONYMS = new Set([
  "USA",
  "NASA",
  "CEO",
  "FAQ",
  "ADA",
  "WCAG",
  "API",
  "SEO",
  "HR",
  "PR",
  "UK",
  "EU",
  "AI",
  "UI",
  "UX",
  "TV",
  "IOS",
  "PDF",
  "HTML",
  "CSS",
  "JS",
]);

export function isAcronymWord(word: string): boolean {
  const cleaned = word.replace(/[^A-Za-z0-9]/g, "");
  if (cleaned.length < 2) return false;
  return KNOWN_ACRONYMS.has(cleaned.toUpperCase());
}

export function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s#@]/g, "")
    .trim();
}

export function extractHashtags(caption: string): string[] {
  const matches = caption.match(/#[A-Za-z0-9_]+/g);
  return matches ?? [];
}

const FILENAME_ALT_PATTERN =
  /^(IMG[_-]?\d+|DSC[_-]?\d+|Screenshot[_-]?\d+|photo|image|pic)[\w.-]*\.(jpg|jpeg|png|webp|gif|heic)$/i;

export function looksLikeFilenameAlt(alt: string): boolean {
  const trimmed = alt.trim();
  if (!trimmed) return false;
  if (/\.(jpg|jpeg|png|webp|gif|heic)$/i.test(trimmed)) return true;
  if (/^IMG[_-]?\d+/i.test(trimmed)) return true;
  if (/^Screenshot[_-]?\d+/i.test(trimmed)) return true;
  return FILENAME_ALT_PATTERN.test(trimmed);
}

/** Detect Mathematical Alphanumeric Symbols and similar styled Unicode. */
export function hasFancyUnicode(text: string): boolean {
  for (const char of text) {
    const code = char.codePointAt(0);
    if (code === undefined) continue;
    if (code >= 0x1d400 && code <= 0x1d7ff) return true;
    if (code >= 0x2100 && code <= 0x214f) return true;
  }
  return false;
}

const FANCY_TO_ASCII: Record<number, string> = (() => {
  const map: Record<number, string> = {};
  const ranges: Array<[number, number, string]> = [
    [0x1d400, 0x1d419, "A"],
    [0x1d41a, 0x1d433, "a"],
    [0x1d434, 0x1d44d, "A"],
    [0x1d44e, 0x1d467, "a"],
    [0x1d468, 0x1d481, "A"],
    [0x1d482, 0x1d49b, "a"],
    [0x1d5a0, 0x1d5b9, "A"],
    [0x1d5ba, 0x1d5d3, "a"],
    [0x1d5d4, 0x1d5ed, "A"],
    [0x1d5ee, 0x1d607, "a"],
    [0x1d608, 0x1d621, "A"],
    [0x1d622, 0x1d63b, "a"],
    [0x1d63c, 0x1d655, "A"],
    [0x1d656, 0x1d66f, "a"],
    [0x1d670, 0x1d689, "A"],
    [0x1d68a, 0x1d6a3, "a"],
  ];
  for (const [start, end, base] of ranges) {
    for (let i = 0; i <= end - start; i++) {
      map[start + i] = String.fromCharCode(base.charCodeAt(0) + i);
    }
  }
  return map;
})();

export function normalizeFancyUnicode(text: string): {
  normalized: string;
  changed: boolean;
} {
  let changed = false;
  const chars: string[] = [];
  for (const char of text) {
    const code = char.codePointAt(0);
    if (code !== undefined && FANCY_TO_ASCII[code]) {
      chars.push(FANCY_TO_ASCII[code]);
      changed = true;
    } else {
      chars.push(char);
    }
  }
  return { normalized: chars.join(""), changed };
}

export function splitEmojiRuns(text: string): string[] {
  return [...text.matchAll(/\p{Extended_Pictographic}+/gu)].map((m) => m[0]);
}

export function countLeadingEmojis(text: string): number {
  const trimmed = text.trimStart();
  let count = 0;
  const regex = /\p{Extended_Pictographic}/gu;
  let i = 0;
  while (i < trimmed.length) {
    regex.lastIndex = i;
    const match = regex.exec(trimmed);
    if (!match || match.index !== i) break;
    count++;
    i = match.index + match[0].length;
    while (trimmed[i] === "\uFE0F" || trimmed[i] === "\u200D") i++;
  }
  const afterEmojis = trimmed.slice(i).trimStart();
  if (afterEmojis.length === 0) return 0;
  return count;
}

export function hasExcessiveConsecutiveEmoji(text: string): boolean {
  const runs = splitEmojiRuns(text);
  for (const run of runs) {
    const chars = [...run];
    let prev = "";
    let streak = 1;
    for (const c of chars) {
      if (c === prev) {
        streak++;
        if (streak >= 3) return true;
      } else {
        prev = c;
        streak = 1;
      }
    }
  }
  return false;
}

export function collapseRepeatedEmoji(text: string): string {
  return text.replace(/(\p{Extended_Pictographic})\1{2,}/gu, "$1$1");
}

export function reduceRepeatedPunctuation(text: string): string {
  return text
    .replace(/!{3,}/g, "!!")
    .replace(/\?{3,}/g, "??")
    .replace(/\.{4,}/g, "...");
}
