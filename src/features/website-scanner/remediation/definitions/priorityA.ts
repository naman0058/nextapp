import type { DeterministicRemediationDefinition } from "@/features/website-scanner/remediation/types";

const V = 1;

export const PRIORITY_A_DEFINITIONS: DeterministicRemediationDefinition[] = [
  {
    ruleId: "color-contrast",
    definitionVersion: V,
    title: "Text color contrast",
    shortProblem:
      "Foreground and background colors do not meet the contrast ratio required for this text.",
    whyItMatters:
      "People with low vision or color-vision differences may be unable to read text when contrast is insufficient.",
    wcagMappings: [{ criterion: "1.4.3", level: "AA" }],
    supportedFrameworks: ["html", "react"],
    remediationSteps: [
      "Identify the exact foreground and background colors axe evaluated (use retained evidence when present).",
      "Determine whether the text qualifies as normal or large text (font size and weight affect the required ratio).",
      "Adjust foreground or background colors so the combination meets at least 4.5:1 for normal text or 3:1 for large text.",
      "Re-check hover, focus, and disabled states if those styles apply to the same text.",
      "Re-run the automated scan and confirm the contrast finding is no longer reported where axe can evaluate it.",
    ],
    whyThisWorks:
      "WCAG contrast requirements are measured from actual rendered color pairs; fixing the colors removes the measurable failure.",
    examples: {
      html: `<!-- Increase contrast between text and background -->
<p class="body-text" style="color: #1a1a1a; background: #ffffff;">Readable body copy</p>`,
      react: `export function PromoBanner() {
  return (
    <p className="text-neutral-900 bg-white">
      Readable body copy
    </p>
  );
}`,
    },
    verificationSteps: [
      { text: "Measure contrast with a trusted contrast tool using the actual rendered colors.", kind: "both" },
      { text: "Confirm the ratio meets the threshold for the text size/weight.", kind: "automated" },
      { text: "Re-run the website scan on the affected page(s).", kind: "automated" },
      { text: "Spot-check hover/focus/disabled variants manually.", kind: "manual" },
    ],
    specializedTool: {
      id: "contrast-checker",
      href: "/image-contrast-checker",
      label: "Contrast checker",
    },
    implementationNotes: [
      "Do not guess replacement colors without measuring the resulting ratio.",
      "Shared theme tokens may affect many occurrences; verify each visible state.",
    ],
    developerAcceptanceCriteria: [
      "Measured contrast meets applicable thresholds for actual text size and weight.",
      "Relevant interactive states were checked where they change text/background colors.",
      "The color-contrast rule is no longer reported on rescanned pages where axe can evaluate it.",
    ],
    sourceReferences: [{ label: "WCAG 1.4.3 Contrast (Minimum)" }],
  },
  {
    ruleId: "image-alt",
    definitionVersion: V,
    title: "Image alternative text",
    shortProblem: "An image is missing alternative text or uses alt inappropriately.",
    whyItMatters:
      "Non-visual users rely on alternative text (or decorative handling) to understand images.",
    wcagMappings: [{ criterion: "1.1.1", level: "A" }],
    requiresHumanJudgment: true,
    supportedFrameworks: ["html", "react"],
    remediationSteps: [
      "Decide whether the image is meaningful, decorative, or functional (automation cannot decide meaning for you).",
      "Meaningful images: provide concise alt text that conveys the same purpose as the image.",
      "Decorative images: use alt=\"\" and ensure they are not the sole carrier of important information.",
      "Functional images (controls): ensure the accessible name communicates the action, not just appearance.",
      "Complex images: provide short alt plus a longer description nearby when needed.",
      "Re-scan and manually review that alt text matches intent in context.",
    ],
    whyThisWorks:
      "Programmatic names let assistive technology expose image purpose; empty alt removes noise for decorative images.",
    examples: {
      html: `<!-- Meaningful -->
<img src="/chart-q3.png" alt="Bar chart: sales up 12% in Q3">

<!-- Decorative -->
<img src="/divider.svg" alt="" role="presentation">`,
      react: `export function ProductPhoto({ name }: { name: string }) {
  return <img src="/photo.jpg" alt={name} />;
}`,
    },
    verificationSteps: [
      { text: "Confirm alt attribute presence and values in the DOM.", kind: "automated" },
      { text: "Review whether alt text accurately describes purpose in context.", kind: "manual" },
      { text: "Re-run automated image-alt rule after changes.", kind: "automated" },
    ],
    specializedTool: {
      id: "image-alt-tools",
      href: "/image-contrast-checker",
      label: "Image / alt text tools",
    },
    limitations: [
      "Automation cannot verify that alt wording is semantically correct—human review remains required.",
    ],
    developerAcceptanceCriteria: [
      "Every meaningful image has appropriate alt text or an equivalent text alternative.",
      "Decorative images use alt=\"\" (or equivalent) and do not hide essential information.",
      "image-alt is no longer reported where automation applies.",
    ],
  },
  {
    ruleId: "link-name",
    definitionVersion: V,
    title: "Link accessible name",
    shortProblem: "A link does not have a discernible accessible name.",
    whyItMatters:
      "Screen readers and voice control users need link names to understand destinations out of context.",
    wcagMappings: [{ criterion: "2.4.4", level: "A" }, { criterion: "4.1.2", level: "A" }],
    supportedFrameworks: ["html", "react"],
    remediationSteps: [
      "Inspect the link element and determine why the accessible name is empty or unusable.",
      "Provide visible link text that describes the destination or action.",
      "For icon-only links, add an accessible name with visible text or aria-label that describes purpose.",
      "Avoid generic text such as “click here” without surrounding context.",
      "Re-scan and test the links list in a screen reader.",
    ],
    whyThisWorks:
      "Accessible names are exposed in the accessibility tree and links menus independent of layout context.",
    examples: {
      html: `<a href="/pricing">View pricing</a>`,
      react: `<Link href="/details">Product details</Link>`,
    },
    verificationSteps: [
      { text: "Inspect accessible name in the browser accessibility tree.", kind: "both" },
      { text: "Navigate links with a screen reader links list.", kind: "manual" },
      { text: "Re-run link-name on affected pages.", kind: "automated" },
    ],
    developerAcceptanceCriteria: [
      "Each affected link exposes a meaningful accessible name.",
      "link-name is no longer reported on rescan.",
    ],
  },
  {
    ruleId: "button-name",
    definitionVersion: V,
    title: "Button accessible name",
    shortProblem: "A button does not expose a discernible accessible name.",
    whyItMatters:
      "Assistive technology announces the button name to convey what action will occur.",
    wcagMappings: [{ criterion: "4.1.2", level: "A" }],
    supportedFrameworks: ["html", "react", "vue"],
    remediationSteps: [
      "Inspect the button markup—icon-only buttons often lack text nodes.",
      "Add visible text that describes the action, or provide aria-label / aria-labelledby when visible text is not possible.",
      "Mark decorative icons aria-hidden=\"true\" when text supplies the name.",
      "Do not invent a specific label unless you know the intended action—choose wording that matches product intent.",
      "Test with keyboard activation and a screen reader.",
    ],
    whyThisWorks:
      "Buttons require an accessible name; native <button> text or valid aria-label satisfies the requirement.",
    examples: {
      html: `<button type="button">Open menu</button>
<button type="button" aria-label="Open menu"><svg aria-hidden="true">…</svg></button>`,
      react: `export function IconButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick}>
      <Icon aria-hidden />
    </button>
  );
}`,
      vue: `<button type="button" :aria-label="label"><Icon aria-hidden="true" /></button>`,
    },
    verificationSteps: [
      { text: "Confirm accessible name in accessibility tree.", kind: "both" },
      { text: "Activate with keyboard only.", kind: "manual" },
      { text: "Re-run button-name rule.", kind: "automated" },
    ],
    developerAcceptanceCriteria: [
      "Each affected button has a meaningful accessible name.",
      "button-name is no longer reported on rescan.",
    ],
  },
  {
    ruleId: "label",
    definitionVersion: V,
    title: "Form field label",
    shortProblem: "A form control lacks an associated label.",
    whyItMatters:
      "Labels tell users what to enter and expose the field name to assistive technology.",
    wcagMappings: [{ criterion: "1.3.1", level: "A" }, { criterion: "3.3.2", level: "A" }, { criterion: "4.1.2", level: "A" }],
    supportedFrameworks: ["html", "react"],
    remediationSteps: [
      "Prefer native <label for=\"id\"> associated with a unique control id.",
      "For grouped inputs, use fieldset/legend or aria-labelledby pointing to visible text.",
      "Do not rely on placeholder text alone as the only label.",
      "Ensure clicking the label moves focus to the control.",
      "Re-scan and test with a screen reader.",
    ],
    whyThisWorks:
      "Programmatic label association exposes the field name and increases hit target for motor impairments.",
    examples: {
      html: `<label for="email">Email</label>
<input id="email" name="email" type="email" autocomplete="email">`,
      react: `<label htmlFor="email">Email</label>
<input id="email" name="email" type="email" />`,
    },
    verificationSteps: [
      { text: "Click label text and confirm focus moves to the field.", kind: "manual" },
      { text: "Inspect accessible name in accessibility tree.", kind: "both" },
      { text: "Re-run label rule.", kind: "automated" },
    ],
    developerAcceptanceCriteria: [
      "Each affected control has a visible or programmatic label.",
      "label is no longer reported on rescan.",
    ],
  },
  {
    ruleId: "bypass",
    definitionVersion: V,
    title: "Bypass blocks (skip link / landmark)",
    shortProblem:
      "No mechanism was detected to bypass repetitive blocks of content.",
    whyItMatters:
      "Keyboard and screen reader users may need to skip repeated navigation to reach main content quickly.",
    wcagMappings: [{ criterion: "2.4.1", level: "A" }],
    supportedFrameworks: ["html", "react"],
    remediationSteps: [
      "Provide a skip link as the first focusable element that moves focus to main content.",
      "Ensure the skip link target exists and is focusable (tabindex=\"-1\" on main if needed).",
      "Alternatively, use a proper main landmark with heading structure—verify keyboard path still works.",
      "Test from document start with keyboard only.",
    ],
    whyThisWorks:
      "Skip links and landmarks give deterministic keyboard paths past repeated chrome.",
    examples: {
      html: `<a href="#main" class="skip-link">Skip to main content</a>
…
<main id="main" tabindex="-1">…</main>`,
    },
    verificationSteps: [
      { text: "From page load, Tab to skip link and activate it.", kind: "manual" },
      { text: "Confirm focus lands in meaningful main content.", kind: "manual" },
      { text: "Re-run bypass rule where applicable.", kind: "automated" },
    ],
    specializedTool: {
      id: "screen-reader-preview",
      href: "/screen-reader-preview",
      label: "Screen reader preview",
    },
    developerAcceptanceCriteria: [
      "Keyboard users can bypass repetitive blocks to reach primary content.",
      "Skip target receives focus and is announced meaningfully.",
    ],
  },
  {
    ruleId: "landmark-one-main",
    definitionVersion: V,
    title: "Single main landmark",
    shortProblem: "The page has zero or multiple main landmarks.",
    whyItMatters:
      "Assistive technology landmark navigation expects one primary main region.",
    wcagMappings: [{ criterion: "2.4.1", level: "A", note: "Best-practice rule in axe" }],
    isBestPracticeRule: true,
    supportedFrameworks: ["html", "react"],
    remediationSteps: [
      "Wrap primary page content in a single <main> element (or role=\"main\").",
      "Remove extra main landmarks used for layout-only sections.",
      "Keep navigation in <nav>, footer in <footer>, etc.",
      "Verify landmark list shows exactly one main.",
    ],
    whyThisWorks:
      "One main landmark clarifies where primary content begins for assistive tech users.",
    examples: {
      html: `<header>…</header>
<nav aria-label="Primary">…</nav>
<main id="main">…primary content…</main>
<footer>…</footer>`,
    },
    verificationSteps: [
      { text: "Review landmark list in accessibility tools.", kind: "both" },
      { text: "Re-run landmark-one-main.", kind: "automated" },
    ],
    developerAcceptanceCriteria: [
      "Exactly one main landmark wraps primary content.",
    ],
  },
  {
    ruleId: "region",
    definitionVersion: V,
    title: "Landmark regions",
    shortProblem: "A landmark region lacks an accessible name when required.",
    whyItMatters:
      "Named landmarks help users distinguish multiple nav/aside regions.",
    wcagMappings: [{ criterion: "2.4.1", level: "A", note: "Best-practice rule in axe" }],
    isBestPracticeRule: true,
    supportedFrameworks: ["html", "react"],
    remediationSteps: [
      "Identify unnamed landmark regions (nav, aside, form, etc.).",
      "Provide aria-label or aria-labelledby with visible heading text.",
      "Prefer native landmarks over redundant ARIA roles.",
      "Ensure names distinguish repeated regions (e.g., Primary vs Footer navigation).",
    ],
    examples: {
      html: `<nav aria-label="Primary">…</nav>
<nav aria-label="Footer">…</nav>`,
    },
    verificationSteps: [
      { text: "List landmarks and confirm each has a distinguishable name.", kind: "manual" },
      { text: "Re-run region rule.", kind: "automated" },
    ],
    developerAcceptanceCriteria: [
      "All required landmark regions have meaningful accessible names.",
    ],
  },
  {
    ruleId: "html-has-lang",
    definitionVersion: V,
    title: "Document language",
    shortProblem: "The html element is missing a valid lang attribute.",
    whyItMatters:
      "Screen readers choose pronunciation rules from the document language.",
    wcagMappings: [{ criterion: "3.1.1", level: "A" }],
    supportedFrameworks: ["html", "react"],
    remediationSteps: [
      "Set lang on the root html element to the primary page language (e.g., lang=\"en\").",
      "For passages in another language, mark those elements with the correct lang value.",
      "Re-scan the document-level rule after deployment.",
    ],
    examples: {
      html: `<html lang="en">`,
      react: `// In Next.js App Router, set lang on <html> in app/layout.tsx`,
    },
    verificationSteps: [
      { text: "Inspect html lang in DOM.", kind: "automated" },
      { text: "Re-run html-has-lang.", kind: "automated" },
    ],
    developerAcceptanceCriteria: [
      "Root html element declares the primary document language.",
    ],
  },
  {
    ruleId: "document-title",
    definitionVersion: V,
    title: "Page title",
    shortProblem: "The document title is missing or not descriptive.",
    whyItMatters:
      "Titles orient users in tabs, history, and screen reader page summaries.",
    wcagMappings: [{ criterion: "2.4.2", level: "A" }],
    supportedFrameworks: ["html", "react"],
    remediationSteps: [
      "Provide a unique, descriptive <title> for each page.",
      "Include page topic and site/brand context where helpful.",
      "Avoid empty or duplicate titles across routes.",
    ],
    examples: {
      html: `<title>Contact us — Acme Corp</title>`,
      react: `export const metadata = { title: "Contact us — Acme Corp" };`,
    },
    verificationSteps: [
      { text: "Check browser tab title and document.title.", kind: "manual" },
      { text: "Re-run document-title rule.", kind: "automated" },
    ],
    developerAcceptanceCriteria: [
      "Each scanned page exposes a descriptive document title.",
    ],
  },
  {
    ruleId: "frame-title",
    definitionVersion: V,
    title: "Frame title",
    shortProblem: "An iframe lacks an accessible name (title attribute or equivalent).",
    whyItMatters:
      "Users need to understand embedded frame purpose before interacting.",
    wcagMappings: [{ criterion: "4.1.2", level: "A" }],
    supportedFrameworks: ["html", "react"],
    remediationSteps: [
      "Add a descriptive title attribute to each iframe describing its purpose.",
      "If the frame is decorative or redundant, reconsider whether it should be embedded.",
      "Ensure title updates if frame content purpose changes dynamically.",
    ],
    examples: {
      html: `<iframe title="Payment form" src="…"></iframe>`,
    },
    verificationSteps: [
      { text: "Inspect iframe title in DOM.", kind: "automated" },
      { text: "Re-run frame-title.", kind: "automated" },
    ],
    developerAcceptanceCriteria: [
      "Each iframe has a meaningful title (or equivalent accessible name).",
    ],
  },
];
