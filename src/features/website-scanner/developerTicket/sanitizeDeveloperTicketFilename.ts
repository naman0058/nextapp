export function sanitizeDeveloperTicketFilename(ruleId: string, ext: "md" | "txt"): string {
  const slug = ruleId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const base = slug ? `accessibility-${slug}-ticket` : "accessibility-ticket";
  return `${base}.${ext}`;
}
