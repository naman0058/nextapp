# Search Engine Launch Checklist

## Before deploy

- [ ] `NEXT_PUBLIC_SITE_URL` set to canonical production origin (https, www or non-www — pick one)
- [ ] `SITE_INDEXABLE=1` on non-Vercel production if needed
- [ ] `npm run audit:seo` passes
- [ ] `npm run build` passes

## After deploy (manual)

- [ ] HTTPS works; HTTP redirects to HTTPS
- [ ] Non-canonical host (www vs apex) redirects to chosen canonical
- [ ] `/robots.txt` allows `/`, disallows `/api/`, lists sitemap URL
- [ ] `/sitemap.xml` returns indexable URLs only
- [ ] `/llms.txt` returns 200 `text/plain`
- [ ] View-source on homepage: title, canonical, WebSite + Organization JSON-LD, OG image
- [ ] Optional: `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` env set

## Google Search Console

- [ ] Add/verify property (Domain preferred when possible)
- [ ] Submit `https://{canonical}/sitemap.xml`
- [ ] URL Inspection: `/`, `/website-accessibility-scanner`, `/sample-accessibility-report`, `/blog`
- [ ] Request indexing for a small set of launch URLs (not mass submission)

## Bing Webmaster Tools

- [ ] Verify site
- [ ] Submit sitemap
- [ ] If `INDEXNOW_KEY` configured, verify `/{key}.txt` and optional blog publish notifications

## IndexNow (optional)

- [ ] Set `INDEXNOW_KEY` (≥8 chars) and deploy; key file served at `/{INDEXNOW_KEY}.txt`
- [ ] Blog import script may POST URL on publish

## Post-launch monitoring

- [ ] Indexed pages, impressions, queries, crawl errors in GSC/Bing
- [ ] Core Web Vitals on homepage, scanner, sample report, blog

No guaranteed rankings or traffic timelines.
