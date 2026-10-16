# Accessibility accuracy benchmark

Controlled local fixtures only (no random live sites).

| Fixture | Expected | Type |
|---------|----------|------|
| `button-name-fail.html` | `button-name` violation present | known-fail |
| `button-name-pass.html` | `button-name` absent | known-pass |

Run integration benchmarks:

```bash
WEBSITE_SCANNER_INTEGRATION=1 WEBSITE_SCANNER_TEST_ALLOW_LOOPBACK=1 npm run test:accessibility
```

Unit tests cover priority, selector normalization, root-cause grouping, and WCAG coverage matrix without a browser.
