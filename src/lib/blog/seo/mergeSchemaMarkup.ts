const ALLOWED_TYPES = new Set(["BlogPosting", "Article"]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeSchemaMarkup(
  base: Record<string, unknown>,
  stored?: Record<string, unknown> | null,
): Record<string, unknown> {
  if (!stored || !isPlainObject(stored)) {
    return { ...base };
  }

  const merged: Record<string, unknown> = { ...base };

  const type = stored["@type"];
  if (typeof type === "string" && ALLOWED_TYPES.has(type)) {
    merged["@type"] = type;
  }

  for (const [key, value] of Object.entries(stored)) {
    if (key === "@context" || key === "@type" || key === "@graph") {
      continue;
    }
    if (key.startsWith("@")) {
      continue;
    }
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      merged[key] = value;
    }
  }

  return merged;
}
