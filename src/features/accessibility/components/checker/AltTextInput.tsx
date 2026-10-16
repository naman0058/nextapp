import { AppField } from "@/components/app/AppField";
import { appInputClassName } from "@/components/app/appStyles";

type AltTextInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
};

export function AltTextInput({
  id,
  value,
  onChange,
  visible,
}: AltTextInputProps) {
  if (!visible) return null;

  return (
    <AppField
      label="Alt text"
      htmlFor={id}
      hint="Describe important information or purpose for someone who cannot see the image. Phase 1 does not verify accuracy against pixels."
    >
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={`${id}-hint`}
        className={appInputClassName}
        placeholder="Example: Fall enrollment flyer with dates and registration URL"
      />
    </AppField>
  );
}
