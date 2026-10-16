# Third-party dependencies (major runtime)

Audit date: **2026-10-15**  
Source: [`package.json`](package.json) / lockfile. Licenses from package metadata (not legal advice).

| Package | Version (package.json) | Purpose | Server / client | License (npm) |
|---------|------------------------|---------|-----------------|---------------|
| next | 16.4.0 | App framework | Both | MIT |
| react / react-dom | 19.3.0 | UI | Client | MIT |
| playwright | ^1.64.1 | Website scan runtime | Server / worker | Apache-2.0 |
| @axe-core/playwright | ^4.13.0 | axe in Playwright | Server / worker | MPL-2.0 |
| axe-core (transitive) | 4.14.0 (see AXE_RULE_COVERAGE) | Rules engine | Server | MPL-2.0 |
| openai | ^7.30.0 | Server OpenAI client | Server only | Apache-2.0 |
| @react-pdf/renderer | ^4.9.0 | PDF reports | Client (dynamic) | MIT |
| exceljs | ^4.4.0 | Website XLSX export | Client dynamic import | MIT |
| jszip | ^3.10.2 | Evidence ZIP, batch | Client dynamic import | MIT or GPL-3.0 (dual) |
| fast-xml-parser | ^5.11.2 | Sitemap parse (XXE-safe opts) | Server | MIT |
| papaparse | ^5.7.0 | CSV parse/export | Client | MIT |
| @vercel/blob | ^2.8.2 | Temp video storage | Server | Apache-2.0 |
| ipaddr.js | ^2.5.0 | SSRF IP parsing | Server | MIT |
| robots-parser | ^3.0.1 | robots.txt | Server | MIT |
| tailwindcss | ^4 | Styling | Build | MIT |

## Duplicate-library note (S4)

- **CSV:** papaparse only for app CSV (no second CSV lib).
- **ZIP:** jszip used for batch + evidence package (single library).
- **PDF:** @react-pdf/renderer only.

## npm audit / outdated

Recorded in [`FINAL_TEST_MATRIX.md`](FINAL_TEST_MATRIX.md) after gate run. Transitive deprecations (exceljs → old glob) noted; no blind major upgrades in S4.
