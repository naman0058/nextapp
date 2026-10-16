# SEO, AEO, and GEO Guidelines (internal)

## SEO

Focus on crawlability, unique intent per URL, accurate titles/descriptions, canonical URLs, sitemap/robots, internal links, performance, and accessible HTML.

## AEO (Answer Engine Optimization)

Use clear questions, direct answers (Quick answer blocks), definitions, steps, and limitations. Important text must be in HTML — not only images or canvas. **No FAQPage schema spam.**

## GEO (Generative Engine Optimization)

Write factual, entity-clear prose with sources on blog posts. Use consistent names (WCAG 2.2, W3C WAI, axe-core). **No special GEO meta tags or invented schema types.**

## llms.txt

[`/llms.txt`](src/app/llms.txt/route.ts) is for systems that choose to consume it. **It is not relied upon for Google Search rankings.**

## Canonical and parameters

Tool query strings (`?view=`, UTM) are not separate indexable URLs; canonical tags point to clean paths.

## Preview / non-production

When `shouldAllowSearchIndexing()` is false, metadata uses `noindex,nofollow` and robots may disallow crawling.
