import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { shouldAllowSearchIndexing } from "@/lib/seo/indexing";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  const indexable = shouldAllowSearchIndexing();

  return {
    rules: {
      userAgent: "*",
      allow: indexable ? "/" : undefined,
      disallow: indexable ? ["/api/"] : ["/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
