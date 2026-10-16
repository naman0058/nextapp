const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugifyCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isValidCategorySlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && slug.length > 0 && slug.length <= 80;
}

export function resolveCategoryDisplayName(
  categorySlug: string,
  publishedCategories: string[],
): string | null {
  const normalized = categorySlug.trim().toLowerCase();
  for (const name of publishedCategories) {
    if (slugifyCategoryName(name) === normalized) {
      return name;
    }
  }
  return null;
}

export function buildCategorySlugMap(categories: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const name of categories) {
    map.set(slugifyCategoryName(name), name);
  }
  return map;
}
