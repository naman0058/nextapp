import type { BlogPost, BlogPostCard } from "@/lib/blog/types";

export type RelatedPostCandidate = BlogPostCard & {
  tags: string[];
  entities_json?: { name: string }[];
};

export function scoreRelatedPost(
  post: BlogPost | BlogPostCard,
  candidate: RelatedPostCandidate,
): number {
  if (candidate.slug === post.slug) {
    return -1;
  }
  let score = 0;
  if (candidate.category === post.category) {
    score += 3;
  }
  const postTags = "tags" in post ? post.tags : [];
  const tagSet = new Set(postTags.map((t) => t.toLowerCase()));
  for (const tag of candidate.tags) {
    if (tagSet.has(tag.toLowerCase())) {
      score += 1;
    }
  }
  const postEntities =
    "entities_json" in post && post.entities_json
      ? post.entities_json.map((e) => e.name.toLowerCase())
      : [];
  const entitySet = new Set(postEntities);
  for (const entity of candidate.entities_json ?? []) {
    if (entitySet.has(entity.name.toLowerCase())) {
      score += 1;
    }
  }
  return score;
}

export function pickTopRelatedPosts<T extends RelatedPostCandidate>(
  post: BlogPost | BlogPostCard,
  candidates: T[],
  limit: number,
): T[] {
  return candidates
    .map((c) => ({ c, score: scoreRelatedPost(post, c) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score || b.c.created_at.getTime() - a.c.created_at.getTime())
    .slice(0, limit)
    .map(({ c }) => c);
}
