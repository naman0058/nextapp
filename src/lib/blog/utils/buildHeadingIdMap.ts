import type { MarkdownHeading } from "@/lib/blog/utils/extractHeadings";

export function buildHeadingIdMap(headings: MarkdownHeading[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const h of headings) {
    map.set(h.text, h.id);
  }
  return map;
}
