"use client";

import type { ContrastTextType } from "@/features/accessibility/types/visualAccessibility";
import { ColorInput } from "@/features/accessibility/components/visual/ColorInput";

const TEXT_TYPES: { value: ContrastTextType; label: string }[] = [
  { value: "normal", label: "Normal text (AA 4.5:1)" },
  { value: "large", label: "Large text (AA 3:1)" },
  { value: "non_text", label: "Non-text UI (3:1 reference)" },
];

type ContrastCalculatorProps = {
  foregroundHex: string;
  backgroundHex: string;
  textType: ContrastTextType;
  parseError: string | null;
  onForegroundHex: (hex: string) => void;
  onBackgroundHex: (hex: string) => void;
  onTextType: (type: ContrastTextType) => void;
};

export function ContrastCalculator({
  foregroundHex,
  backgroundHex,
  textType,
  parseError,
  onForegroundHex,
  onBackgroundHex,
  onTextType,
}: ContrastCalculatorProps) {
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sm font-semibold text-foreground">
          Text type
        </legend>
        <div className="mt-2 space-y-2">
          {TEXT_TYPES.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="contrast-text-type"
                value={option.value}
                checked={textType === option.value}
                onChange={() => onTextType(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <ColorInput
        label="Foreground"
        hex={foregroundHex}
        onHexChange={onForegroundHex}
        error={parseError}
      />
      <ColorInput
        label="Background"
        hex={backgroundHex}
        onHexChange={onBackgroundHex}
      />
      <div
        className="rounded-lg border border-border p-4 text-center text-lg font-semibold"
        style={{
          color: foregroundHex,
          backgroundColor: backgroundHex,
        }}
        aria-hidden
      >
        Sample text Aa
      </div>
      <p className="text-xs text-muted">
        Opaque colors only. Transparency and overlays are not measured.
        Gradients and photos may need multiple background samples below.
      </p>
    </div>
  );
}
