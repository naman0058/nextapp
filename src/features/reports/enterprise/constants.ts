/** Canonical enterprise report schema (Phase 8). */
export const ENTERPRISE_REPORT_SCHEMA_VERSION = "8.0";

export const ENTERPRISE_BRAND_NAME = "DigitalAccessReady";
export const ENTERPRISE_TAGLINE = "Find it. Fix it. Verify it.";

/** Representative evidence shown in main PDF body per finding group. */
export const ENTERPRISE_PDF_MAIN_EVIDENCE_LIMIT = 5;

/** Representative evidence in PDF technical appendix per finding. */
export const ENTERPRISE_PDF_APPENDIX_EVIDENCE_LIMIT = 20;

export const BANNED_REPORT_PHRASES = [
  "compliance %",
  "accessibility score",
  "ada score",
  "legal-risk score",
  "lawsuit probability",
  "certified",
  "100% compliant",
  "non-compliant",
  "partially compliant",
  "wcag compliant",
  "ai verified",
  "ai fixed",
] as const;

export const EXECUTIVE_SHORT_NOTE =
  "Automated testing cannot evaluate every accessibility requirement. Human review remains necessary.";

export const ZERO_FINDING_NOTE =
  "No automated WCAG failures were detected in the scanned state. Automated testing cannot establish complete accessibility. Human review remains necessary.";

export const WCAG_COUNT_DISCLAIMER =
  "These counts describe test coverage and outcomes. They are not a WCAG compliance percentage.";

export const PASSING_RULES_DISCLAIMER =
  "Passing an automated check does not establish full compliance with the associated WCAG criterion.";

export const REPRESENTATIVE_REVIEW_DISCLOSURE =
  "Representative review — this result does not confirm every page or viewport.";
