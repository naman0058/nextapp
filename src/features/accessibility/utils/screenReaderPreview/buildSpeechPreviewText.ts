import { SPEECH_INCLUDE_IMAGE_DESCRIPTION_LABEL } from "@/features/accessibility/constants/screenReaderPreview";

export function buildSpeechPreviewText(options: {
  caption: string;
  altText: string;
  hasImage: boolean;
  linkLabel?: string;
}): string {
  const parts: string[] = [];
  const cap = options.caption.trim();
  if (cap) parts.push(cap);

  if (options.linkLabel?.trim()) {
    parts.push(options.linkLabel.trim());
  }

  if (options.hasImage) {
    const alt = options.altText.trim();
    if (alt) {
      if (SPEECH_INCLUDE_IMAGE_DESCRIPTION_LABEL) {
        parts.push(`Image description: ${alt}.`);
      } else {
        parts.push(alt);
      }
    }
  }

  if (parts.length === 0) return "";
  return `${parts.join("\n\n")}\n\nEnd of post.`;
}
