import type { DeterministicFixTemplate } from "@/features/accessibility-intelligence/knowledge/ruleKnowledge";

const RULE_CRITERIA: Record<string, string[]> = {
  "button-name": [
    "Each affected interactive button exposes an accessible name.",
    "The accessible name describes the button's purpose or action.",
    "Visible labels and accessible names do not conflict.",
    "Decorative icon content is not announced redundantly.",
    "The automated `button-name` finding is no longer detected on affected pages after rescan.",
    "Relevant keyboard and screen-reader behavior has been manually reviewed.",
  ],
  "link-name": [
    "Each affected link exposes an accessible name.",
    "The link purpose is clear from the accessible name or visible text.",
    "Generic link text (for example, \"click here\") is avoided where context is insufficient.",
    "The automated `link-name` finding is no longer detected after rescan.",
    "Keyboard focus and link purpose are manually verified.",
  ],
  "image-alt": [
    "Each affected image has an appropriate text-alternative treatment.",
    "Meaningful images have context-appropriate alternative text.",
    "Decorative images use appropriate decorative treatment.",
    "Functional images communicate the action or purpose.",
    "The automated missing-alt finding is no longer detected after rescan.",
    "Alt-text quality is manually reviewed.",
  ],
  label: [
    "Each affected form control has a programmatically associated accessible label.",
    "The label describes the expected input.",
    "Placeholder text alone is not used as the only label.",
    "Required and error states remain understandable.",
    "The automated label finding is no longer detected after rescan.",
    "Form behavior is manually tested.",
  ],
  "select-name": [
    "Each affected select control has an accessible name.",
    "The name describes the purpose of the selection.",
    "The automated `select-name` finding is no longer detected after rescan.",
    "Keyboard operation of the control is manually verified.",
  ],
  "input-button-name": [
    "Each affected input button exposes an accessible name.",
    "The name describes the control's action.",
    "The automated finding is no longer detected after rescan.",
  ],
  "html-has-lang": [
    "The document has a valid `lang` attribute on the root element.",
    "The language value matches the primary page language.",
    "The automated `html-has-lang` finding is no longer detected after rescan.",
  ],
  "document-title": [
    "The page contains a meaningful non-empty document title.",
    "The title identifies page purpose or context.",
    "The automated `document-title` finding is no longer detected after rescan.",
  ],
  "color-contrast": [
    "Foreground and background combinations meet applicable contrast thresholds for actual text size and weight.",
    "Normal, hover, and focus states are reviewed where relevant.",
    "The automated contrast finding is no longer detected where axe can evaluate it.",
    "Complex backgrounds are manually checked where necessary.",
  ],
  "aria-valid-attr": [
    "Affected elements use only valid ARIA attribute names and values.",
    "Invalid ARIA attributes are removed or corrected.",
    "The automated finding is no longer detected after rescan.",
  ],
  "aria-required-attr": [
    "Required ARIA attributes are present for the roles in use.",
    "The automated finding is no longer detected after rescan.",
  ],
  "aria-prohibited-attr": [
    "Prohibited ARIA attributes are removed from affected elements.",
    "The automated finding is no longer detected after rescan.",
  ],
  "aria-roles": [
    "ARIA roles used on affected elements are valid and appropriate.",
    "The automated finding is no longer detected after rescan.",
  ],
  "frame-title": [
    "Each affected frame or iframe has a descriptive accessible title.",
    "The automated `frame-title` finding is no longer detected after rescan.",
  ],
  "landmark-one-main": [
    "The page has one primary main landmark where applicable.",
    "The automated finding is no longer detected after rescan.",
    "Page structure is manually reviewed.",
  ],
  region: [
    "Affected landmark regions have accessible names when needed.",
    "Landmarks are not duplicated without distinction.",
    "The automated finding is no longer detected after rescan.",
  ],
  list: [
    "List markup is used for grouped list content.",
    "The automated list finding is no longer detected after rescan.",
  ],
  listitem: [
    "List items are contained within proper list structures.",
    "The automated finding is no longer detected after rescan.",
  ],
  "td-headers-attr": [
    "Table data cells reference appropriate header cells.",
    "The automated finding is no longer detected after rescan.",
    "Table navigation is manually tested.",
  ],
  "th-has-data-cells": [
    "Table headers are associated with data cells.",
    "The automated finding is no longer detected after rescan.",
  ],
};

export function acceptanceCriteriaForRule(
  ruleId: string,
  template?: DeterministicFixTemplate,
  humanReviewRequired?: boolean,
): string[] {
  const specific = RULE_CRITERIA[ruleId];
  if (specific?.length) return [...specific];
  const generic: string[] = [];
  if (template?.whatIsWrong) {
    generic.push(`The issue described (${template.whatIsWrong.trim()}) is addressed on affected elements.`);
  }
  generic.push("The recommended fix pattern is applied consistently on affected pages.");
  generic.push(`The automated \`${ruleId}\` finding is no longer detected on affected pages after rescan.`);
  if (humanReviewRequired) {
    generic.push("Related manual accessibility checks are completed.");
  } else {
    generic.push("Keyboard and assistive-technology behavior is spot-checked where relevant.");
  }
  return generic;
}
