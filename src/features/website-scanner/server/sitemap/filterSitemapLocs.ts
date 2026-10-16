export function filterSameOriginLocs(
  locs: { loc: string; lastmod?: string }[],
  reviewOrigin: string,
): {
  accepted: { loc: string; lastmod?: string }[];
  externalIgnored: number;
} {
  let externalIgnored = 0;
  const accepted: { loc: string; lastmod?: string }[] = [];
  for (const entry of locs) {
    try {
      const u = new URL(entry.loc);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        externalIgnored += 1;
        continue;
      }
      if (u.origin !== reviewOrigin) {
        externalIgnored += 1;
        continue;
      }
      accepted.push(entry);
    } catch {
      externalIgnored += 1;
    }
  }
  return { accepted, externalIgnored };
}
