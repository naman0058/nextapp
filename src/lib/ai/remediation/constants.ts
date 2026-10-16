export const AI_REMEDIATION_PROMPT_VERSION = "1.1";
export const AI_REMEDIATION_SCHEMA_VERSION = "1.0";
export const AI_REMEDIATION_REPORT_VERSION = "1.0";

export const MAX_AI_REMEDIATION_SNIPPETS = 3;
export const MAX_AI_REMEDIATION_SELECTORS = 5;
export const MAX_AI_REMEDIATION_CONTEXT_CHARS = 12_000;
export const MAX_SUGGESTED_CODE_LINES = 120;
export const MAX_REMEDIATION_REQUEST_BYTES = 64_000;

export const MAX_STRING_FIELD_CHARS = 4_000;
export const MAX_ARRAY_ITEMS = 20;
export const MAX_ALTERNATIVES = 5;

/** Default caps — override via env where noted in config helpers */
export const DEFAULT_MAX_AI_REMEDIATIONS_PER_MINUTE = 5;
export const DEFAULT_MAX_AI_REMEDIATIONS_PER_SESSION = 12;
export const DEFAULT_MAX_AI_REMEDIATIONS_PER_SCAN = 8;

export const REMEDIATION_SESSION_CACHE_TTL_MS = 45 * 60 * 1000;
export const REMEDIATION_SESSION_CACHE_MAX_ENTRIES = 500;

export const AI_REMEDIATION_SCHEMA_NAME = "ai_remediation_report";
