import { AppField } from "@/components/app/AppField";
import { appTextareaClassName } from "@/components/app/appStyles";

type CaptionInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
};

export function CaptionInput({ id, value, onChange }: CaptionInputProps) {
  const length = value.length;

  return (
    <AppField
      label="Caption"
      htmlFor={id}
      hint="Paste the caption or post text you plan to publish. Checks run locally in your browser."
      meta={
        <span id={`${id}-count`} className="text-xs tabular-nums text-muted" aria-live="polite">
          {length} character{length === 1 ? "" : "s"}
        </span>
      }
    >
      <textarea
        id={id}
        name="caption"
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={`${id}-hint ${id}-count`}
        placeholder="Example: Join us Friday for our community workshop. #CommunityWorkshop"
        className={appTextareaClassName}
      />
    </AppField>
  );
}
