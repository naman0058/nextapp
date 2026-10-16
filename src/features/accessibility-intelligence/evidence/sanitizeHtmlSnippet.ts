const SENSITIVE_ATTR = /^(value|srcdoc|nonce|integrity|autocomplete)$/i;
const SUSPICIOUS_DATA = /^data-(?:auth|token|key|secret|session)/i;

export function sanitizeHtmlSnippet(html: string | undefined): string | undefined {
  if (!html) return undefined;
  return html.replace(
    /\s([a-zA-Z_:][\w:.-]*)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/g,
    (match, attr: string) => {
      const name = attr.toLowerCase();
      if (SENSITIVE_ATTR.test(name) || SUSPICIOUS_DATA.test(name)) {
        return ` ${attr}="[redacted]"`;
      }
      return match;
    },
  );
}
