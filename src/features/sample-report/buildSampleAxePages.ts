import { getRuleKnowledge } from "@/features/accessibility-intelligence/knowledge/ruleKnowledge";
import { calculateContrastRatio } from "@/features/accessibility/utils/contrast/contrastRatio";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";
import type {
  WebsiteAccessibilityViolation,
  WebsitePageScanResult,
  WebsiteViolationNode,
} from "@/features/website-scanner/types/scanTypes";
import { SAMPLE_ROOT_URL } from "@/features/sample-report/constants";

const AXE_VERSION = "4.13.0";
const SCANNER_VERSION = "sample-fixture-1.0";
const SCANNED_AT = "2026-03-15T14:00:00.000Z";

const SAMPLE_PATHS = [
  "/",
  "/events",
  "/membership",
  "/resources",
  "/contact",
  "/about",
  "/services",
  "/news",
] as const;

const PAGE_TITLES: Record<(typeof SAMPLE_PATHS)[number], string> = {
  "/": "Northstar Community Library",
  "/events": "Events — Northstar Community Library",
  "/membership": "Membership — Northstar Community Library",
  "/resources": "Resources — Northstar Community Library",
  "/contact": "Contact — Northstar Community Library",
  "/about": "About — Northstar Community Library",
  "/services": "Services — Northstar Community Library",
  "/news": "News — Northstar Community Library",
};

/** #767676 on #ffffff ≈ 4.48:1 — fails normal text AA (4.5:1). */
const CONTRAST_FG = { r: 118, g: 118, b: 118 };
const CONTRAST_BG = { r: 255, g: 255, b: 255 };
const CONTRAST_RATIO = calculateContrastRatio(CONTRAST_FG, CONTRAST_BG);

function urlForPath(path: string): string {
  return path === "/" ? SAMPLE_ROOT_URL : `${SAMPLE_ROOT_URL}${path}`;
}

function node(
  selector: string,
  options: {
    html?: string;
    landmark?: WebsiteViolationNode["landmarkContext"];
    domSignature?: string;
    tag?: string;
    role?: string;
  } = {},
): WebsiteViolationNode {
  return {
    target: [selector],
    selectorLabel: selector,
    htmlSnippet: options.html,
    landmarkContext: options.landmark ?? "unknown",
    domSignature: options.domSignature ?? `${selector}::sig`,
    elementContext: {
      tag: options.tag,
      role: options.role,
    },
  };
}

const RULE_META: Record<
  string,
  { impact: WebsiteAccessibilityViolation["impact"]; wcag: string[]; level: "A" | "AA" }
> = {
  "button-name": { impact: "serious", wcag: ["4.1.2"], level: "A" },
  label: { impact: "critical", wcag: ["1.3.1", "4.1.2"], level: "A" },
  "color-contrast": { impact: "serious", wcag: ["1.4.3"], level: "AA" },
  "image-alt": { impact: "critical", wcag: ["1.1.1"], level: "A" },
  "link-name": { impact: "serious", wcag: ["2.4.4", "4.1.2"], level: "A" },
  "frame-title": { impact: "serious", wcag: ["4.1.2"], level: "A" },
  "heading-order": { impact: "moderate", wcag: ["1.3.1"], level: "A" },
};

function violation(
  ruleId: string,
  nodes: WebsiteViolationNode[],
  overrides: Partial<WebsiteAccessibilityViolation> = {},
): WebsiteAccessibilityViolation {
  const knowledge = getRuleKnowledge(ruleId);
  const meta = RULE_META[ruleId] ?? { impact: "serious" as const, wcag: ["4.1.2"], level: "A" as const };
  const impact = overrides.impact ?? meta.impact;
  return {
    id: ruleId,
    impact,
    help: knowledge?.plainTitle ?? ruleId,
    description:
      knowledge?.deterministicFixTemplate?.whatIsWrong ??
      "Accessibility issue detected.",
    helpUrl: "https://dequeuniversity.com/rules/axe/",
    tags: ["wcag2aa", "wcag21aa"],
    wcagCriteria: meta.wcag,
    level: meta.level,
    totalNodeCount: nodes.length,
    nodes,
    isBestPractice: false,
    ...overrides,
  };
}

const NAV_BUTTON_SIG = "shared-nav-menu-toggle-v1";

function navButtonNodes(count: number): WebsiteViolationNode[] {
  return Array.from({ length: count }, () =>
    node("header nav button.menu-toggle", {
      html: '<button class="menu-toggle" aria-label=""><svg aria-hidden="true"></svg></button>',
      landmark: "navigation",
      domSignature: NAV_BUTTON_SIG,
      tag: "button",
    }),
  );
}

type PageSpec = {
  path: (typeof SAMPLE_PATHS)[number];
  desktop: WebsiteAccessibilityViolation[];
  mobile?: WebsiteAccessibilityViolation[];
};

function buildPageSpecs(): PageSpec[] {
  return [
    {
      path: "/",
      desktop: [
        violation("button-name", navButtonNodes(2)),
        violation("label", [
          node("#search-input", {
            html: '<input id="search-input" placeholder="Search">',
            landmark: "main",
            tag: "input",
          }),
        ]),
        violation("color-contrast", [
          node("footer .secondary-link", {
            html: `<a class="secondary-link" style="color:#767676">Hours &amp; locations</a>`,
            landmark: "footer",
            domSignature: "footer-secondary-link-contrast",
            tag: "a",
          }),
        ], {
          description: `Elements must have sufficient color contrast (${CONTRAST_RATIO.toFixed(2)}:1 measured for sample).`,
        }),
      ],
      mobile: [
        violation("button-name", navButtonNodes(1), { impact: "serious" }),
        violation("label", [
          node("#search-input", {
            html: '<input id="search-input" placeholder="Search">',
            landmark: "main",
            tag: "input",
          }),
        ]),
      ],
    },
    {
      path: "/events",
      desktop: [violation("button-name", navButtonNodes(2))],
      mobile: [violation("button-name", navButtonNodes(1))],
    },
    {
      path: "/membership",
      desktop: [
        violation("button-name", navButtonNodes(2)),
        violation("label", [
          node("form.membership #email", {
            html: '<input id="email" type="email">',
            landmark: "form",
            tag: "input",
          }),
          node("form.membership #zip", {
            html: '<input id="zip" type="text">',
            landmark: "form",
            tag: "input",
          }),
        ]),
      ],
      mobile: [violation("button-name", navButtonNodes(1))],
    },
    {
      path: "/resources",
      desktop: [
        violation("button-name", navButtonNodes(2)),
        violation("image-alt", [
          node("main img.hero-card", {
            html: '<img class="hero-card" src="/sample/hero.jpg">',
            landmark: "main",
            tag: "img",
          }),
        ], { impact: "critical" }),
      ],
      mobile: [violation("button-name", navButtonNodes(1))],
    },
    {
      path: "/contact",
      desktop: [
        violation("button-name", navButtonNodes(2)),
        violation("label", [
          node("#contact-name", { landmark: "form", tag: "input" }),
          node("#contact-message", { landmark: "form", tag: "textarea" }),
        ]),
        violation("link-name", [
          node('a[href="/pdf"]', {
            html: '<a href="/pdf">Click here</a>',
            landmark: "main",
            tag: "a",
          }),
        ], { impact: "serious" }),
      ],
      mobile: [
        violation("button-name", navButtonNodes(1)),
        violation("link-name", [
          node('a[href="/pdf"]', {
            html: '<a href="/pdf">Click here</a>',
            landmark: "main",
            tag: "a",
          }),
        ]),
      ],
    },
    {
      path: "/about",
      desktop: [
        violation("button-name", navButtonNodes(2)),
        violation("heading-order", [
          node("main h4.intro", {
            html: "<h4 class=\"intro\">Our mission</h4>",
            landmark: "main",
            tag: "h4",
          }),
        ], { impact: "moderate" }),
      ],
    },
    {
      path: "/services",
      desktop: [
        violation("frame-title", [
          node("iframe#booking-widget", {
            html: '<iframe id="booking-widget" src="about:blank"></iframe>',
            landmark: "main",
            tag: "iframe",
          }),
        ], { impact: "serious" }),
        violation("link-name", [
          node("main a.card-link", {
            html: '<a class="card-link" href="/services/rooms">Read more</a>',
            landmark: "main",
            tag: "a",
          }),
          node("main a.card-link-2", {
            html: '<a class="card-link-2" href="/services/programs">More</a>',
            landmark: "main",
            tag: "a",
          }),
        ]),
      ],
    },
    {
      path: "/news",
      desktop: [
        violation("color-contrast", [
          node(".news-meta", {
            html: '<span class="news-meta" style="color:#767676">Posted yesterday</span>',
            landmark: "main",
            tag: "span",
          }),
          node(".news-tag", {
            html: '<span class="news-tag" style="color:#767676">Community</span>',
            landmark: "main",
            tag: "span",
          }),
        ], { impact: "serious" }),
        violation("image-alt", [
          node("article img.thumb", {
            html: '<img class="thumb" src="/sample/thumb.jpg">',
            landmark: "main",
            tag: "img",
          }),
        ], { impact: "moderate" }),
        violation("button-name", navButtonNodes(1)),
      ],
    },
  ];
}

function summarizeViolations(violations: WebsiteAccessibilityViolation[]) {
  const summary = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
    unknown: 0,
    incomplete: 0,
    bestPractice: 0,
  };
  for (const v of violations) {
    if (v.isBestPractice) {
      summary.bestPractice += 1;
      continue;
    }
    summary[v.impact] += 1;
  }
  return summary;
}

function buildScanResult(
  path: string,
  viewport: "desktop" | "mobile",
  violationsList: WebsiteAccessibilityViolation[],
): WebsitePageScanResult {
  const vp = SCAN_VIEWPORTS[viewport];
  return {
    requestedUrl: urlForPath(path),
    finalUrl: urlForPath(path),
    pageTitle: PAGE_TITLES[path as (typeof SAMPLE_PATHS)[number]] ?? path,
    scannedAt: SCANNED_AT,
    viewport: vp,
    httpStatus: 200,
    durationMs: 4200,
    axeVersion: AXE_VERSION,
    scannerVersion: SCANNER_VERSION,
    summary: summarizeViolations(violationsList),
    violations: violationsList,
    incomplete: [],
    passesCount: 40,
    inapplicableCount: 12,
    discoveredLinks: [],
    warnings: [],
    pageMetadata: {
      documentLang: "en",
      domNodeCount: 800,
      internalLinkCount: 24,
      linkCount: 30,
      iframeCount: path === "/services" ? 1 : 0,
      formCount: ["/membership", "/contact"].includes(path) ? 1 : 0,
      imageCount: ["/resources", "/news"].includes(path) ? 2 : 0,
      headingCount: 6,
      videoCount: 0,
      interactiveControlCount: 12,
      dialogHintCount: 0,
    },
    scanCompleteness: "complete",
    scanQuality: {
      pageFullyLoaded: true,
      resourceBudgetExceeded: false,
      domTruncated: false,
      nodeEvidenceTruncated: false,
      crossOriginFrameLimitations: false,
      lazyContentSampling: "completed",
      scanTimeout: false,
    },
  };
}

export function buildSampleAxePages(): WebsitePageScanResult[] {
  const specs = buildPageSpecs();
  const results: WebsitePageScanResult[] = [];
  for (const spec of specs) {
    results.push(buildScanResult(spec.path, "desktop", spec.desktop));
    if (spec.mobile) {
      results.push(buildScanResult(spec.path, "mobile", spec.mobile));
    }
  }
  return results;
}

/** Previous scan for rescan demo — more label + button occurrences. */
export function buildSampleRescanPreviousPages(): WebsitePageScanResult[] {
  const current = buildSampleAxePages();
  return current.map((page) => {
    const cloned = structuredClone(page);
    if (cloned.violations.some((v) => v.id === "button-name")) {
      const v = cloned.violations.find((x) => x.id === "button-name")!;
      v.nodes = navButtonNodes(Math.max(2, v.nodes.length + 1));
      v.totalNodeCount = v.nodes.length;
    }
    if (page.finalUrl.includes("/membership") || page.finalUrl.includes("/contact")) {
      if (!cloned.violations.some((v) => v.id === "label")) {
        cloned.violations.push(
          violation("label", [
            node("form.extra-field", { landmark: "form", tag: "input" }),
          ]),
        );
      } else {
        const v = cloned.violations.find((x) => x.id === "label")!;
        v.nodes = [...v.nodes, node("form.extra-field", { landmark: "form", tag: "input" })];
        v.totalNodeCount = v.nodes.length;
      }
    }
    return cloned;
  });
}

/** After partial remediation — navigation buttons fixed on desktop pages. */
export function buildSampleRescanCurrentPages(): WebsitePageScanResult[] {
  const current = buildSampleAxePages();
  return current.map((page) => {
    const cloned = structuredClone(page);
    cloned.violations = cloned.violations.filter((v) => v.id !== "button-name");
    if (cloned.violations.some((v) => v.id === "label")) {
      const v = cloned.violations.find((x) => x.id === "label")!;
      if (v.nodes.length > 1) {
        v.nodes = v.nodes.slice(0, 1);
        v.totalNodeCount = 1;
      }
    }
    return cloned;
  });
}

export function getSamplePagePaths(): string[] {
  return SAMPLE_PATHS.map((p) => urlForPath(p));
}
