import type { AltTextSource } from "@/features/accessibility/types/screenReaderPreview";
import { Card } from "@/components/ui/Card";

type ImageDescriptionPreviewProps = {
  hasImage: boolean;
  altText: string;
  altTextSource: AltTextSource;
  imagePurposeNote: string | null;
};

const SOURCE_LABELS: Record<AltTextSource, string> = {
  user: "User-entered",
  ai_applied: "AI suggestion applied by user",
  none: "Not provided",
};

export function ImageDescriptionPreview({
  hasImage,
  altText,
  altTextSource,
  imagePurposeNote,
}: ImageDescriptionPreviewProps) {
  if (!hasImage) return null;

  return (
    <Card className="space-y-2 p-4">
      <h3 className="text-sm font-semibold text-foreground">
        Image description
      </h3>
      <p className="text-xs text-muted">
        Alt-text source: {SOURCE_LABELS[altTextSource]}
      </p>
      {altText.trim() ? (
        <p className="whitespace-pre-wrap text-sm">{altText.trim()}</p>
      ) : (
        <p className="text-sm text-amber-950">
          REVIEW — Image description requires review. If this image communicates
          meaningful information, provide an appropriate description when
          publishing.
        </p>
      )}
      {imagePurposeNote ? (
        <p className="text-xs text-muted">{imagePurposeNote}</p>
      ) : null}
    </Card>
  );
}
