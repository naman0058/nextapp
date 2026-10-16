import type { WcagAutomationClass } from "@/features/accessibility-intelligence/types/siteIntelligence";

export type WcagCatalogEntry = {
  criterion: string;
  name: string;
  level: "A" | "AA";
  principle: "Perceivable" | "Operable" | "Understandable" | "Robust";
  automation: WcagAutomationClass;
  /** axe rule ids that may signal this criterion (partial coverage). */
  relatedAxeRules: string[];
};

/** Curated WCAG 2.2 Level A + AA catalog — concise summaries, conservative automation class. */
export const WCAG_22_AA_CATALOG: WcagCatalogEntry[] = [
  { criterion: "1.1.1", name: "Non-text Content", level: "A", principle: "Perceivable", automation: "partial", relatedAxeRules: ["image-alt", "input-image-alt", "object-alt", "svg-img-alt"] },
  { criterion: "1.2.1", name: "Audio-only and Video-only (Prerecorded)", level: "A", principle: "Perceivable", automation: "manual", relatedAxeRules: [] },
  { criterion: "1.2.2", name: "Captions (Prerecorded)", level: "A", principle: "Perceivable", automation: "manual", relatedAxeRules: [] },
  { criterion: "1.2.3", name: "Audio Description or Media Alternative", level: "A", principle: "Perceivable", automation: "manual", relatedAxeRules: [] },
  { criterion: "1.3.1", name: "Info and Relationships", level: "A", principle: "Perceivable", automation: "partial", relatedAxeRules: ["label", "form-field-multiple-labels", "list", "definition-list", "dlitem", "table-duplicate-name", "th-has-data-cells", "td-headers-attr"] },
  { criterion: "1.3.2", name: "Meaningful Sequence", level: "A", principle: "Perceivable", automation: "manual", relatedAxeRules: [] },
  { criterion: "1.3.4", name: "Orientation", level: "AA", principle: "Perceivable", automation: "manual", relatedAxeRules: [] },
  { criterion: "1.3.5", name: "Identify Input Purpose", level: "AA", principle: "Perceivable", automation: "partial", relatedAxeRules: ["autocomplete-valid"] },
  { criterion: "1.4.1", name: "Use of Color", level: "A", principle: "Perceivable", automation: "manual", relatedAxeRules: [] },
  { criterion: "1.4.2", name: "Audio Control", level: "A", principle: "Perceivable", automation: "manual", relatedAxeRules: [] },
  { criterion: "1.4.3", name: "Contrast (Minimum)", level: "AA", principle: "Perceivable", automation: "partial", relatedAxeRules: ["color-contrast"] },
  { criterion: "1.4.4", name: "Resize Text", level: "AA", principle: "Perceivable", automation: "manual", relatedAxeRules: [] },
  { criterion: "1.4.10", name: "Reflow", level: "AA", principle: "Perceivable", automation: "manual", relatedAxeRules: [] },
  { criterion: "1.4.11", name: "Non-text Contrast", level: "AA", principle: "Perceivable", automation: "partial", relatedAxeRules: ["link-in-text-block"] },
  { criterion: "1.4.12", name: "Text Spacing", level: "AA", principle: "Perceivable", automation: "manual", relatedAxeRules: [] },
  { criterion: "1.4.13", name: "Content on Hover or Focus", level: "AA", principle: "Perceivable", automation: "manual", relatedAxeRules: [] },
  { criterion: "2.1.1", name: "Keyboard", level: "A", principle: "Operable", automation: "manual", relatedAxeRules: ["scrollable-region-focusable"] },
  { criterion: "2.1.2", name: "No Keyboard Trap", level: "A", principle: "Operable", automation: "manual", relatedAxeRules: [] },
  { criterion: "2.1.4", name: "Character Key Shortcuts", level: "A", principle: "Operable", automation: "manual", relatedAxeRules: [] },
  { criterion: "2.2.1", name: "Timing Adjustable", level: "A", principle: "Operable", automation: "manual", relatedAxeRules: ["meta-refresh"] },
  { criterion: "2.2.2", name: "Pause, Stop, Hide", level: "A", principle: "Operable", automation: "manual", relatedAxeRules: ["blink", "marquee"] },
  { criterion: "2.3.1", name: "Three Flashes or Below Threshold", level: "A", principle: "Operable", automation: "partial", relatedAxeRules: ["meta-refresh-no-exceptions"] },
  { criterion: "2.4.1", name: "Bypass Blocks", level: "A", principle: "Operable", automation: "partial", relatedAxeRules: ["bypass", "skip-link"] },
  { criterion: "2.4.2", name: "Page Titled", level: "A", principle: "Operable", automation: "automated", relatedAxeRules: ["document-title"] },
  { criterion: "2.4.3", name: "Focus Order", level: "A", principle: "Operable", automation: "manual", relatedAxeRules: [] },
  { criterion: "2.4.4", name: "Link Purpose (In Context)", level: "A", principle: "Operable", automation: "partial", relatedAxeRules: ["link-name"] },
  { criterion: "2.4.5", name: "Multiple Ways", level: "AA", principle: "Operable", automation: "manual", relatedAxeRules: [] },
  { criterion: "2.4.6", name: "Headings and Labels", level: "AA", principle: "Operable", automation: "partial", relatedAxeRules: ["empty-heading", "heading-order"] },
  { criterion: "2.4.7", name: "Focus Visible", level: "AA", principle: "Operable", automation: "manual", relatedAxeRules: [] },
  { criterion: "2.4.11", name: "Focus Not Obscured (Minimum)", level: "AA", principle: "Operable", automation: "manual", relatedAxeRules: [] },
  { criterion: "2.5.1", name: "Pointer Gestures", level: "A", principle: "Operable", automation: "manual", relatedAxeRules: [] },
  { criterion: "2.5.2", name: "Pointer Cancellation", level: "A", principle: "Operable", automation: "manual", relatedAxeRules: [] },
  { criterion: "2.5.3", name: "Label in Name", level: "A", principle: "Operable", automation: "partial", relatedAxeRules: ["label-content-name-mismatch"] },
  { criterion: "2.5.4", name: "Motion Actuation", level: "A", principle: "Operable", automation: "manual", relatedAxeRules: [] },
  { criterion: "2.5.7", name: "Dragging Movements", level: "AA", principle: "Operable", automation: "manual", relatedAxeRules: [] },
  { criterion: "2.5.8", name: "Target Size (Minimum)", level: "AA", principle: "Operable", automation: "partial", relatedAxeRules: ["target-size"] },
  { criterion: "3.1.1", name: "Language of Page", level: "A", principle: "Understandable", automation: "automated", relatedAxeRules: ["html-has-lang", "html-lang-valid", "html-xml-lang-mismatch"] },
  { criterion: "3.1.2", name: "Language of Parts", level: "AA", principle: "Understandable", automation: "partial", relatedAxeRules: ["valid-lang"] },
  { criterion: "3.2.1", name: "On Focus", level: "A", principle: "Understandable", automation: "manual", relatedAxeRules: [] },
  { criterion: "3.2.2", name: "On Input", level: "A", principle: "Understandable", automation: "manual", relatedAxeRules: [] },
  { criterion: "3.2.3", name: "Consistent Navigation", level: "AA", principle: "Understandable", automation: "manual", relatedAxeRules: [] },
  { criterion: "3.2.4", name: "Consistent Identification", level: "AA", principle: "Understandable", automation: "manual", relatedAxeRules: [] },
  { criterion: "3.2.6", name: "Consistent Help", level: "A", principle: "Understandable", automation: "manual", relatedAxeRules: [] },
  { criterion: "3.3.1", name: "Error Identification", level: "A", principle: "Understandable", automation: "manual", relatedAxeRules: [] },
  { criterion: "3.3.2", name: "Labels or Instructions", level: "A", principle: "Understandable", automation: "partial", relatedAxeRules: ["label", "select-name", "input-button-name"] },
  { criterion: "3.3.3", name: "Error Suggestion", level: "AA", principle: "Understandable", automation: "manual", relatedAxeRules: [] },
  { criterion: "3.3.4", name: "Error Prevention (Legal, Financial, Data)", level: "AA", principle: "Understandable", automation: "manual", relatedAxeRules: [] },
  { criterion: "3.3.7", name: "Redundant Entry", level: "A", principle: "Understandable", automation: "manual", relatedAxeRules: [] },
  { criterion: "3.3.8", name: "Accessible Authentication (Minimum)", level: "AA", principle: "Understandable", automation: "manual", relatedAxeRules: [] },
  { criterion: "4.1.2", name: "Name, Role, Value", level: "A", principle: "Robust", automation: "partial", relatedAxeRules: ["button-name", "link-name", "aria-allowed-attr", "aria-required-attr", "aria-valid-attr", "aria-valid-attr-value", "aria-roles", "aria-hidden-focus"] },
  { criterion: "4.1.3", name: "Status Messages", level: "AA", principle: "Robust", automation: "partial", relatedAxeRules: ["aria-live-region"] },
];
