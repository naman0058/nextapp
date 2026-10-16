import { sanitizeHtmlSnippet } from "@/features/accessibility-intelligence/evidence/sanitizeHtmlSnippet";

/** Remove C0/C1 control chars except tab/newline/carriage return. */
export function stripUnsafeControlCharacters(text: string): string {
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");
}

/** Escape inline Markdown metacharacters in untrusted strings (not inside code fences). */
export function escapeMarkdownInline(text: string): string {
  return stripUnsafeControlCharacters(text).replace(/([\\`*_{}[\]()#+.!|>-])/g, "\\$1");
}

export function sanitizeTicketHtmlSnippet(html: string | undefined): string | undefined {
  if (!html) return undefined;
  const cleaned = sanitizeHtmlSnippet(html) ?? html;
  return stripUnsafeControlCharacters(cleaned.trim());
}

/** Pick a fence that does not appear in snippet body. */
export function pickCodeFence(content: string): string {
  if (!content.includes("```")) return "```";
  if (!content.includes("~~~")) return "~~~";
  return "````";
}

export function fenceCodeBlock(content: string, language = "html"): string {
  const fence = pickCodeFence(content);
  return `${fence}${language}\n${content}\n${fence}`;
}
