# SEO Route Inventory

Source of truth: `src/lib/seo/route-registry.ts` (static routes). Dynamic blog routes use MongoDB metadata.

| Route | Page Type | Primary Intent | Primary Keyword | Index | Sitemap | Title | SEO Status |
|-------|-----------|----------------|-----------------|-------|---------|-------|------------|
| / | CONTENT | Hub for free accessibility preflight tools | accessibility preflight tools | INDEX | Yes | Free Accessibility Preflight Tools for Web & Social | Ready |
| /social-media-accessibility-checker | PRIMARY_TOOL | Check social posts before publishing | social media accessibility checker | INDEX | Yes | Social Media Accessibility Checker | Ready |
| /instagram-accessibility-checker | PLATFORM_TOOL | Instagram post accessibility preflight | Instagram accessibility checker | INDEX | Yes | Instagram Accessibility Checker | Ready |
| /facebook-accessibility-checker | PLATFORM_TOOL | Facebook post accessibility preflight | Facebook accessibility checker | INDEX | Yes | Facebook Accessibility Checker | Ready |
| /linkedin-accessibility-checker | PLATFORM_TOOL | LinkedIn post accessibility preflight | LinkedIn accessibility checker | INDEX | Yes | LinkedIn Accessibility Checker | Ready |
| /x-accessibility-checker | PLATFORM_TOOL | X post accessibility preflight | X accessibility checker | INDEX | Yes | X Accessibility Checker | Ready |
| /image-contrast-checker | PRIMARY_TOOL | Measure WCAG contrast | color contrast checker | INDEX | Yes | Color Contrast Checker | Ready |
| /screen-reader-preview | PRIMARY_TOOL | Approximate listening experience for social content | screen reader preview | INDEX | Yes | Screen Reader Preview | Ready |
| /video-accessibility-checker | PRIMARY_TOOL | Video caption and accessibility preflight | video accessibility checker | INDEX | Yes | Video Accessibility Checker | Ready |
| /batch-accessibility-checker | PRIMARY_TOOL | Bulk social accessibility review | batch accessibility checker | INDEX | Yes | Batch Accessibility Checker | Ready |
| /website-accessibility-scanner | PRIMARY_TOOL | Automated website WCAG scan | website accessibility scanner | INDEX | Yes | Website Accessibility Scanner | Ready |
| /sample-accessibility-report | SAMPLE | Example website accessibility report | sample accessibility report | INDEX | Yes | Sample Website Accessibility Report | Ready |
| /accessibility-preflight-report | CONTENT | How to generate preflight reports from tools | accessibility preflight report | INDEX | Yes | Accessibility Preflight Report | Ready |
| /methodology | CONTENT | Explain testing methodology and limits | accessibility testing methodology | INDEX | Yes | Accessibility Testing Methodology | Ready |
| /tools | UTILITY | Directory of all preflight tools | accessibility tools | INDEX | Yes | All Accessibility Tools | Ready |
| /blog | BLOG_INDEX | Accessibility guides and resources | accessibility guides | INDEX | Yes | Accessibility Guides & Resources | Ready |
| /about | TRUST_LEGAL | Brand and product clarity | Accessible Content Preflight | INDEX | Yes | About Accessible Content Preflight | Ready |
| /contact | TRUST_LEGAL | Support and feedback contact | contact | INDEX | Yes | Contact | Ready |
| /privacy | TRUST_LEGAL | Privacy policy | privacy policy | INDEX | Yes | Privacy Policy | Ready |
| /terms | TRUST_LEGAL | Terms of use | terms of use | INDEX | Yes | Terms of Use | Ready |
| /disclaimer | TRUST_LEGAL | Automated guidance disclaimer | disclaimer | INDEX | Yes | Disclaimer | Ready |
| /accessibility | TRUST_LEGAL | Accessibility statement | accessibility statement | INDEX | Yes | Accessibility Statement | Ready |
| /blog/[slug] | BLOG_ARTICLE | Published guide | (per post) | INDEX when published | Yes when published | (DB meta_title) | Ready |
| /blog/category/[categorySlug] | BLOG_CATEGORY | Category hub | (per category) | INDEX when populated | Yes when ≥ min posts | (dynamic) | Ready |

## Excluded from index

- All `/api/*` routes (not public marketing)
- Non-production deployments (`robots` + `noindex` metadata when indexing disabled)
- Draft / unknown blog slugs (404)
- Thin blog categories (noindex via metadata)
