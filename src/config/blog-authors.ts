export type BlogAuthorConfig = {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  url?: string;
  publisherName: string;
};

const AUTHORS: Record<string, BlogAuthorConfig> = {
  editorial: {
    id: "editorial",
    name: "Accessible Content Preflight Editorial",
    title: "Accessibility editorial team",
    bio: "Practical guidance on WCAG-aligned content, social accessibility, and preflight workflows.",
    publisherName: "Accessible Content Preflight",
  },
};

const FALLBACK = AUTHORS.editorial;

export function getBlogAuthor(authorId: string): BlogAuthorConfig {
  const author = AUTHORS[authorId];
  if (!author) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[blog] unknown author_id "${authorId}", using fallback`);
    }
    return { ...FALLBACK, id: authorId };
  }
  return author;
}
