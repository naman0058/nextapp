import type { WebsiteViolationNode } from "@/features/website-scanner/types/scanTypes";

export function selectRepresentativeNodes<T extends WebsiteViolationNode>(
  nodes: T[],
  maxCount: number,
): T[] {
  if (nodes.length <= maxCount) return nodes;
  const byKey = new Map<string, T>();
  for (const node of nodes) {
    const key =
      node.domSignature ??
      `${node.landmarkContext ?? "u"}::${node.selectorLabel}`;
    if (!byKey.has(key)) {
      byKey.set(key, node);
    }
    if (byKey.size >= maxCount) break;
  }
  const picked = [...byKey.values()];
  if (picked.length < maxCount) {
    for (const node of nodes) {
      if (picked.includes(node)) continue;
      picked.push(node);
      if (picked.length >= maxCount) break;
    }
  }
  return picked.slice(0, maxCount);
}
