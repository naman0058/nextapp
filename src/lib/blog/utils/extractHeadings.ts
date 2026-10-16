export type MarkdownHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function extractMarkdownHeadings(content: string): MarkdownHeading[] {
  const lines = content.split("\n");
  const headings: MarkdownHeading[] = [];
  const usedIds = new Map<string, number>();

  for (const line of lines) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    const level = match[1].length as 2 | 3;
    if (level !== 2 && level !== 3) continue;
    const text = match[2].replace(/\s+#+\s*$/, "").trim();
    let id = slugifyHeading(text);
    if (!id) continue;
    const seen = usedIds.get(id) ?? 0;
    if (seen > 0) {
      id = `${id}-${seen + 1}`;
    }
    usedIds.set(slugifyHeading(text), seen + 1);
    headings.push({ id, text, level });
  }

  return headings;
}
