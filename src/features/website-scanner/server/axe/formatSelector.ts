export function formatAxeTarget(target: unknown): string {
  if (typeof target === "string") return target;
  if (Array.isArray(target)) {
    return target
      .map((part) => {
        if (typeof part === "string") return part;
        if (Array.isArray(part)) return part.join(" ");
        return String(part);
      })
      .join(" > ");
  }
  try {
    return JSON.stringify(target);
  } catch {
    return String(target);
  }
}
