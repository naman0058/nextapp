/** Central scanner limits — do not scatter magic numbers. */
export const MAX_SITE_SCAN_PAGES = 25;
export const MAX_DUAL_VIEWPORT_PAGES = 10;
export const MAX_CRAWL_DEPTH = 2;
export const SITE_SCAN_CONCURRENCY = 1;
export const SITE_CRAWL_DELAY_MS = 600;
export const PAGE_NAVIGATION_TIMEOUT_MS = 20_000;
export const PAGE_TOTAL_SCAN_TIMEOUT_MS = 30_000;
export const MAX_DISCOVERED_LINKS_PER_PAGE = 100;
export const MAX_DOM_NODES = 50_000;
export const MAX_AXE_NODES_PER_RULE = 20;
export const MAX_TOTAL_REPORTED_NODES_PER_PAGE = 200;
export const MAX_REDIRECTS = 5;
export const MAX_NETWORK_REQUESTS_PER_PAGE = 300;
export const MAX_SCROLL_STEPS = 8;
export const SCROLL_STEP_PAUSE_MS = 400;
export const PAGE_SETTLE_MS = 1_500;
export const MAX_HTML_SNIPPET_CHARS = 500;
export const MAX_WEBSITE_AI_RULES_PER_REQUEST = 15;
export const MAX_AI_NODES_PER_RULE = 3;
export const SCANNER_GLOBAL_MAX_CONCURRENT = 2;
export const SCANNER_GLOBAL_DEFAULT_CONCURRENT = 1;
/** @deprecated use SITE_CRAWL_DELAY_MS for multi-page scans */
export const PER_DOMAIN_POLITENESS_MS = SITE_CRAWL_DELAY_MS;
export const ROBOTS_CACHE_TTL_MS = 5 * 60 * 1000;
export const ROBOTS_FETCH_TIMEOUT_MS = 8_000;

export const MAX_SITEMAP_DOWNLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_SITEMAP_DISCOVERED_URLS = 5000;
export const MAX_SITEMAP_INDEX_FILES = 50;
export const MAX_SITEMAP_INDEX_DEPTH = 2;

export const MAX_REPORT_LOGO_SIZE_BYTES = 1024 * 1024;

export const SITE_BATCH_REGISTRY_TTL_MS = 30 * 60 * 1000;
