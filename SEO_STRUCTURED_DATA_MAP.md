# Structured Data Map

| Route | JSON-LD types | Notes |
|-------|---------------|-------|
| `/` | WebSite, Organization | Factual name, url, logo, email; sameAs only if configured |
| `/blog/[slug]` | BlogPosting, BreadcrumbList | From Mongo dates/authors; matches visible article |
| `/sample-accessibility-report` | WebPage, BreadcrumbList | Fictional sample disclosure in page body |
| Tool pages | (optional WebPage) | No SoftwareApplication without honest app metadata |
| Trust/legal | — | WebPage via metadata only |

**Not used:** FAQPage (mass), AggregateRating, Review, fake addresses or social profiles.
