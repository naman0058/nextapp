import { AppPanel } from "@/components/app/AppPanel";
import { appTextareaClassName } from "@/components/app/appStyles";
import { Button } from "@/components/ui/Button";

type WorkingCaptionProps = {
  value: string;
  onChange: (value: string) => void;
  onCopy: () => void;
  copyMessage: string | null;
  canUndo: boolean;
  onUndo: () => void;
};

export function WorkingCaption({
  value,
  onChange,
  onCopy,
  copyMessage,
  canUndo,
  onUndo,
}: WorkingCaptionProps) {
  return (
    <AppPanel
      id="workspace-final-copy"
      title="Final caption"
      description="Edit after applying fixes, then copy for publishing. Re-run preflight if you change content."
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        className={appTextareaClassName}
        aria-label="Working caption"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="primary" onClick={onCopy}>
          Copy caption
        </Button>
        {canUndo && (
          <Button type="button" variant="secondary" onClick={onUndo}>
            Undo last change
          </Button>
        )}
      </div>
      <p className="mt-3 min-h-[1.25rem] text-sm font-medium text-primary" role="status" aria-live="polite">
        {copyMessage ?? ""}
      </p>
    </AppPanel>
  );
}
