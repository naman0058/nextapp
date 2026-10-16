/** CSS-module style tokens (e.g. css-1abc12), not semantic utilities like btn-primary. */
const HASH_CLASS = /^(?:css|sc|styled|chakra|mui)-[a-z0-9]{4,}$/i;
const NUMERIC_ID = /^[a-z]*\d{3,}$/i;

export function normalizeSelectorForGrouping(selector: string): string {
  let s = selector.trim();
  s = s.replace(/:nth-child\(\d+\)/gi, "");
  s = s.replace(/:nth-of-type\(\d+\)/gi, "");
  s = s.replace(/#[a-z0-9_-]*\d{3,}[a-z0-9_-]*/gi, "#[id]");
  s = s.replace(/\.([a-zA-Z0-9_-]+)/g, (_, cls: string) => {
    if (HASH_CLASS.test(cls)) return ".[hash]";
    return `.${cls}`;
  });
  s = s.replace(/\s+/g, " ").trim();
  return s || selector;
}

export function isLikelyGeneratedId(id: string): boolean {
  return NUMERIC_ID.test(id);
}
