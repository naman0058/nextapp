export type DeterministicFixTemplate = {
  whatIsWrong: string;
  whyItMatters: string;
  genericPattern: string;
  whatNotToDo: string;
  howToVerify: string;
};

export type RuleKnowledge = {
  ruleId: string;
  plainTitle?: string;
  userImpact?: string;
  fixCategory?: string;
  deterministicFixTemplate?: DeterministicFixTemplate;
  beforeExample?: string;
  afterExample?: string;
  manualVerificationSteps?: string[];
  groupingHints?: string[];
  commonFalsePositiveNotes?: string[];
};

const RULE_KNOWLEDGE: Record<string, RuleKnowledge> = {
  "button-name": {
    ruleId: "button-name",
    plainTitle: "Button accessible name",
    userImpact:
      "Screen-reader users may encounter a button without knowing what action it performs.",
    manualVerificationSteps: [
      "Inspect the affected control.",
      "Give the button a visible text label or valid accessible name.",
      "Ensure the name communicates the button's purpose.",
      "Re-run the automated scan.",
      "Confirm with a screen reader or accessibility-tree inspection where appropriate.",
    ],
    deterministicFixTemplate: {
      whatIsWrong: "A button lacks an accessible name.",
      whyItMatters: "Assistive technology needs a name to announce the control's purpose.",
      genericPattern:
        '<button type="button">Open menu</button>\n<!-- or -->\n<button type="button" aria-label="Open menu">…</button>',
      whatNotToDo: "Do not rely on icon-only buttons without aria-label or visible text.",
      howToVerify: "Check the accessibility tree shows a meaningful name for the button.",
    },
    beforeExample: '<button type="button"><svg aria-hidden="true">…</svg></button>',
    afterExample:
      '<button type="button" aria-label="Open menu"><svg aria-hidden="true">…</svg></button>',
  },
  "image-alt": {
    ruleId: "image-alt",
    plainTitle: "Image alternative text",
    userImpact:
      "People who cannot see the image may miss information conveyed visually.",
    manualVerificationSteps: [
      "Determine whether the image is meaningful or decorative.",
      "If meaningful, ensure alternative text communicates equivalent purpose.",
      "If decorative, use appropriate decorative treatment.",
      "Review context manually.",
      "Rescan.",
    ],
    deterministicFixTemplate: {
      whatIsWrong: "An image is missing alternative text or has an empty alt.",
      whyItMatters: "Non-visual users cannot perceive information conveyed by the image.",
      genericPattern:
        '<img src="chart.png" alt="Sales increased 12% in Q3">\n<!-- decorative: alt="" -->',
      whatNotToDo: "Do not use alt text that repeats nearby visible text without purpose.",
      howToVerify: "Confirm meaningful images have alt; decorative images are hidden from AT.",
    },
    beforeExample: '<img src="logo.png">',
    afterExample: '<img src="logo.png" alt="Acme Corporation">',
  },
  "color-contrast": {
    ruleId: "color-contrast",
    plainTitle: "Text color contrast",
    userImpact:
      "Low-vision users may have difficulty reading text when foreground and background colors are too similar.",
    manualVerificationSteps: [
      "Identify actual foreground and background colors.",
      "Measure contrast ratio.",
      "Verify required threshold for text size.",
      "Test hover, focus, and disabled states separately where relevant.",
    ],
  },
  label: {
    ruleId: "label",
    plainTitle: "Form field label",
    userImpact:
      "Screen-reader and voice-input users may not know what information a form field expects.",
    deterministicFixTemplate: {
      whatIsWrong: "A form control does not have an associated visible or programmatic label.",
      whyItMatters: "Users need to know what to enter and which field has focus.",
      genericPattern:
        '<label for="email">Email</label>\n<input id="email" name="email" type="email">',
      whatNotToDo: "Do not rely on placeholder text alone as the only label.",
      howToVerify: "Click the label text and confirm focus moves to the field.",
    },
    beforeExample: '<input type="text" placeholder="Email">',
    afterExample:
      '<label for="email">Email</label><input id="email" type="email" name="email">',
  },
  "link-name": {
    ruleId: "link-name",
    plainTitle: "Link accessible name",
    userImpact:
      "Users navigating links out of context may not understand the link destination or purpose.",
    deterministicFixTemplate: {
      whatIsWrong: "A link has no discernible accessible name.",
      whyItMatters: "Link lists and screen readers read the name without surrounding context.",
      genericPattern: '<a href="/pricing">View pricing</a>',
      whatNotToDo: 'Avoid vague link text like "click here" without context.',
      howToVerify: "Review links in a screen reader links list.",
    },
    beforeExample: '<a href="/details"><span class="icon-arrow"></span></a>',
    afterExample: '<a href="/details">View product details</a>',
  },
  "html-has-lang": {
    ruleId: "html-has-lang",
    plainTitle: "Document language",
    userImpact:
      "Screen readers may use incorrect pronunciation when the document language is not identified.",
    deterministicFixTemplate: {
      whatIsWrong: "The html element is missing a valid lang attribute.",
      whyItMatters: "Assistive technology selects pronunciation and language rules from lang.",
      genericPattern: '<html lang="en">',
      whatNotToDo: "Do not omit lang on the primary document.",
      howToVerify: "Inspect html lang matches the primary page language.",
    },
    beforeExample: "<html>",
    afterExample: '<html lang="en">',
  },
  "document-title": {
    ruleId: "document-title",
    plainTitle: "Page title",
    userImpact:
      "Users may not orient themselves when the page title is missing or generic.",
    deterministicFixTemplate: {
      whatIsWrong: "The document title is missing or not descriptive.",
      whyItMatters: "Titles appear in tabs, history, and screen reader page summaries.",
      genericPattern: "<title>Contact us — Acme Corp</title>",
      whatNotToDo: "Avoid empty or duplicate titles across all pages.",
      howToVerify: "Check the browser tab and accessibility tree document name.",
    },
  },
  "aria-valid-attr": {
    ruleId: "aria-valid-attr",
    plainTitle: "Valid ARIA attributes",
    userImpact:
      "Invalid ARIA can cause assistive technologies to receive incorrect or unusable information.",
    deterministicFixTemplate: {
      whatIsWrong: "An element uses an invalid or misspelled ARIA attribute.",
      whyItMatters: "Invalid ARIA may be ignored or misinterpreted.",
      genericPattern: 'Use documented WAI-ARIA attributes only (e.g. aria-label, aria-expanded).',
      whatNotToDo: "Do not invent aria-* attribute names.",
      howToVerify: "Validate attributes against WAI-ARIA specification.",
    },
  },
  "aria-valid-attr-value": {
    ruleId: "aria-valid-attr-value",
    plainTitle: "Valid ARIA attribute values",
    userImpact: "Incorrect ARIA values can break component semantics for assistive tech.",
    deterministicFixTemplate: {
      whatIsWrong: "An ARIA attribute has a value that is not allowed for that attribute.",
      whyItMatters: "Assistive technologies rely on correct token values.",
      genericPattern: 'aria-expanded="true" | "false"',
      whatNotToDo: 'Do not use aria-expanded="yes".',
      howToVerify: "Inspect ARIA attributes in the accessibility tree.",
    },
  },
  "aria-required-attr": {
    ruleId: "aria-required-attr",
    plainTitle: "Required ARIA attributes",
    userImpact: "Missing required ARIA properties can make custom widgets unusable.",
    deterministicFixTemplate: {
      whatIsWrong: "A widget role is missing required ARIA attributes.",
      whyItMatters: "Roles like combobox or slider require specific properties.",
      genericPattern: "Consult WAI-ARIA role requirements for the role in use.",
      whatNotToDo: "Do not apply complex roles without required states/properties.",
      howToVerify: "Test the widget with keyboard and screen reader.",
    },
  },
  list: {
    ruleId: "list",
    plainTitle: "List structure",
    userImpact: "Screen readers may not announce list length and structure correctly.",
    fixCategory: "best-practice",
    deterministicFixTemplate: {
      whatIsWrong: "List markup is used incorrectly (e.g. li outside ul/ol).",
      whyItMatters: "Proper lists help users understand grouped items.",
      genericPattern: "<ul><li>Item</li></ul>",
      whatNotToDo: "Do not use lists purely for layout without list semantics need.",
      howToVerify: "Navigate lists with a screen reader.",
    },
  },
  "landmark-one-main": {
    ruleId: "landmark-one-main",
    plainTitle: "Single main landmark",
    userImpact: "Users may struggle to jump to primary content without a main landmark.",
    fixCategory: "best-practice",
    deterministicFixTemplate: {
      whatIsWrong: "The page has zero or multiple main landmarks.",
      whyItMatters: "Landmarks provide quick navigation in assistive technology.",
      genericPattern: '<main id="main">…primary content…</main>',
      whatNotToDo: "Do not wrap every section in main.",
      howToVerify: "Use landmark navigation in a screen reader.",
    },
  },
  region: {
    ruleId: "region",
    plainTitle: "Landmark regions",
    userImpact: "Unlabeled regions are harder to discover in landmark menus.",
    fixCategory: "best-practice",
    deterministicFixTemplate: {
      whatIsWrong: "A landmark region lacks an accessible name when needed.",
      whyItMatters: "Named regions distinguish repeated page areas.",
      genericPattern: '<nav aria-label="Primary">…</nav>',
      whatNotToDo: "Do not duplicate unlabeled nav landmarks.",
      howToVerify: "Review landmark list in accessibility tools.",
    },
  },
};

export function getRuleKnowledge(ruleId: string): RuleKnowledge | undefined {
  return RULE_KNOWLEDGE[ruleId];
}

export function getUserImpactForRule(
  ruleId: string,
  axeHelp: string,
): string {
  return RULE_KNOWLEDGE[ruleId]?.userImpact ?? axeHelp;
}

export function getVerificationStepsForRule(ruleId: string): string[] {
  return RULE_KNOWLEDGE[ruleId]?.manualVerificationSteps ?? [];
}
