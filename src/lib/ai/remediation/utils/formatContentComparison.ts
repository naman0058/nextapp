export type ContentComparisonLine = {
  kind: "same" | "removed" | "added" | "changed";
  original?: string;
  suggested?: string;
};

/** Lightweight caption comparison without a diff library. */
export function formatContentComparison(
  original: string,
  suggested: string,
): ContentComparisonLine[] {
  const origLines = original.split(/\n/);
  const suggLines = suggested.split(/\n/);
  const max = Math.max(origLines.length, suggLines.length);
  const out: ContentComparisonLine[] = [];

  for (let i = 0; i < max; i++) {
    const o = origLines[i];
    const s = suggLines[i];
    if (o === undefined && s !== undefined) {
      out.push({ kind: "added", suggested: s });
    } else if (o !== undefined && s === undefined) {
      out.push({ kind: "removed", original: o });
    } else if (o === s) {
      out.push({ kind: "same", original: o, suggested: s });
    } else {
      out.push({ kind: "changed", original: o, suggested: s });
    }
  }

  if (out.length === 0 && original === suggested) {
    return [{ kind: "same", original, suggested }];
  }

  return out;
}
