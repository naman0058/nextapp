import type { ProductFindingCategory } from "@/features/website-scanner/taxonomy/types";

const EXACT: Record<string, ProductFindingCategory> = {
  "color-contrast": "Visual & Contrast",
  "color-contrast-enhanced": "Visual & Contrast",
  "link-in-text-block": "Visual & Contrast",
  "image-alt": "Images & Alternatives",
  "object-alt": "Images & Alternatives",
  "svg-img-alt": "Images & Alternatives",
  "input-image-alt": "Images & Alternatives",
  "area-alt": "Images & Alternatives",
  "role-img-alt": "Images & Alternatives",
  "image-redundant-alt": "Images & Alternatives",
  bypass: "Navigation & Links",
  "skip-link": "Navigation & Links",
  region: "Structure & Landmarks",
  "landmark-one-main": "Structure & Landmarks",
  "landmark-unique": "Structure & Landmarks",
  "landmark-no-duplicate-banner": "Structure & Landmarks",
  "landmark-complementary-is-top-level": "Structure & Landmarks",
  "page-has-heading-one": "Structure & Landmarks",
  "heading-order": "Structure & Landmarks",
  "empty-heading": "Structure & Landmarks",
  "p-as-heading": "Structure & Landmarks",
  label: "Forms & Input",
  "form-field-multiple-labels": "Forms & Input",
  "label-title-only": "Forms & Input",
  "autocomplete-valid": "Forms & Input",
  "link-name": "Navigation & Links",
  "button-name": "Names, Roles & ARIA",
  "input-button-name": "Names, Roles & ARIA",
  "document-title": "Language & Metadata",
  "html-has-lang": "Language & Metadata",
  "html-lang-valid": "Language & Metadata",
  "html-xml-lang-mismatch": "Language & Metadata",
  "valid-lang": "Language & Metadata",
  "meta-viewport": "Language & Metadata",
  "meta-viewport-large": "Language & Metadata",
  "meta-refresh": "Language & Metadata",
  "target-size": "Keyboard & Focus",
  "scrollable-region-focusable": "Keyboard & Focus",
  "frame-focusable-content": "Keyboard & Focus",
  "nested-interactive": "Keyboard & Focus",
  "video-caption": "Media",
  "video-description": "Media",
  "audio-caption": "Media",
  "no-autoplay-audio": "Media",
  list: "Tables & Lists",
  listitem: "Tables & Lists",
  "definition-list": "Tables & Lists",
  dlitem: "Tables & Lists",
  "td-headers-attr": "Tables & Lists",
  "th-has-data-cells": "Tables & Lists",
  "scope-attr-valid": "Tables & Lists",
  "table-duplicate-name": "Tables & Lists",
  "table-fake-caption": "Tables & Lists",
};

function prefixCategory(ruleId: string): ProductFindingCategory | null {
  if (ruleId.startsWith("aria-")) return "Names, Roles & ARIA";
  if (ruleId.startsWith("frame-")) return "Dynamic Content";
  return null;
}

export function primaryCategoryForRule(
  ruleId: string,
  isBestPractice: boolean,
): ProductFindingCategory {
  if (EXACT[ruleId]) return EXACT[ruleId];
  const pref = prefixCategory(ruleId);
  if (pref) return pref;
  if (isBestPractice) return "Best Practices";
  return "Dynamic Content";
}
