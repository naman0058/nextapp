import type { ReadingOrderItem } from "@/features/accessibility/types/screenReaderPreview";
import { extractHttpUrls } from "@/features/accessibility/utils/helpers/linkHelpers";
import { extractHashtags } from "@/features/accessibility/utils/helpers/textHelpers";

function stripHashtagsFromCaption(caption: string): string {
  let body = caption;
  for (const tag of extractHashtags(caption)) {
    body = body.replace(
      new RegExp(`${tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"),
      "",
    );
  }
  return body.replace(/\s{2,}/g, " ").trim();
}

export function buildReadingOrderPreview(options: {
  caption: string;
  altText: string;
  hasImage: boolean;
  linkLabel?: string;
}): ReadingOrderItem[] {
  const items: ReadingOrderItem[] = [];
  let seq = 0;
  const id = () => `order-${seq++}`;

  const body = stripHashtagsFromCaption(options.caption);
  if (body) {
    items.push({
      id: id(),
      type: "caption",
      label: "Caption",
      content: body,
    });
  }

  const tags = extractHashtags(options.caption);
  if (tags.length > 0) {
    items.push({
      id: id(),
      type: "hashtag",
      label: "Hashtags",
      content: tags.join(" "),
    });
  }

  if (options.hasImage) {
    const alt = options.altText.trim();
    if (alt) {
      items.push({
        id: id(),
        type: "image_description",
        label: "Image description (alt text in this preflight)",
        content: alt,
      });
    } else {
      items.push({
        id: id(),
        type: "image_description",
        label: "Image description",
        content: "Image description not provided in this preflight.",
        warnings: [
          "If this image communicates meaningful information, provide an appropriate description when publishing.",
        ],
      });
    }
  }

  if (options.linkLabel?.trim()) {
    items.push({
      id: id(),
      type: "link",
      label: "Link information",
      content: options.linkLabel.trim(),
    });
  }

  for (const url of extractHttpUrls(options.caption)) {
    items.push({
      id: id(),
      type: "link",
      label: "URL in caption",
      content: url,
    });
  }

  return items;
}

export function buildContentOrderLabels(
  readingOrder: ReadingOrderItem[],
): string[] {
  const labels: string[] = [];
  if (readingOrder.some((i) => i.type === "caption")) labels.push("Caption");
  if (readingOrder.some((i) => i.type === "hashtag")) labels.push("Hashtags");
  if (readingOrder.some((i) => i.type === "image_description")) {
    labels.push("Image description");
  }
  if (readingOrder.some((i) => i.type === "link")) {
    labels.push("Link information");
  }
  return labels;
}
