import type { AutoFixDescriptor } from "@/features/accessibility/types/preflight";
import { Button } from "@/components/ui/Button";

type FixPreviewProps = {
  fix: AutoFixDescriptor;
  currentCaption: string;
  onApply: () => void;
  onDismiss: () => void;
};

export function FixPreview({
  fix,
  currentCaption,
  onApply,
  onDismiss,
}: FixPreviewProps) {
  return (
    <div className="mt-3 rounded-lg border border-border bg-muted-bg p-3 text-sm">
      <p className="font-semibold text-foreground">Suggested fix preview</p>
      <p className="mt-2 text-xs font-medium text-muted">Original</p>
      <p className="mt-1 whitespace-pre-wrap text-foreground">{currentCaption}</p>
      <p className="mt-2 text-xs font-medium text-muted">Suggested</p>
      <p className="mt-1 whitespace-pre-wrap text-foreground">
        {fix.previewCaption}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="primary" onClick={onApply}>
          Apply suggestion
        </Button>
        <Button type="button" variant="ghost" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
