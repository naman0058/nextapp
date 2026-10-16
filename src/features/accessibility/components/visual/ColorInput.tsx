"use client";

import { useId } from "react";
import {
  ColorParseError,
  formatRgb,
  parseHexColor,
} from "@/features/accessibility/utils/contrast/parseColor";

type ColorInputProps = {
  label: string;
  hex: string;
  onHexChange: (hex: string) => void;
  error?: string | null;
};

export function ColorInput({ label, hex, onHexChange, error }: ColorInputProps) {
  const id = useId();
  let rgbText = "";
  try {
    rgbText = formatRgb(parseHexColor(hex));
  } catch {
    rgbText = "Invalid color";
  }

  function handleHexBlur(value: string) {
    const trimmed = value.trim();
    if (!trimmed.startsWith("#")) {
      onHexChange(`#${trimmed.replace(/^#/, "")}`);
      return;
    }
    onHexChange(trimmed.toUpperCase());
  }

  function handleColorPicker(value: string) {
    onHexChange(value.toUpperCase());
  }

  let pickerValue = "#000000";
  try {
    parseHexColor(hex);
    pickerValue = hex.startsWith("#") ? hex : `#${hex}`;
  } catch {
    pickerValue = "#000000";
  }

  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <input
          id={id}
          type="color"
          value={pickerValue.startsWith("#") ? pickerValue : "#000000"}
          onChange={(e) => handleColorPicker(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded border border-border bg-card p-1"
          aria-describedby={`${id}-rgb`}
        />
        <input
          type="text"
          inputMode="text"
          defaultValue={hex}
          key={hex}
          onBlur={(e) => {
            try {
              parseHexColor(e.target.value);
              handleHexBlur(e.target.value);
            } catch (err) {
              if (err instanceof ColorParseError) {
                e.target.value = hex;
              }
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className="min-w-[7rem] flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm"
          aria-label={`${label} hex`}
        />
        <span id={`${id}-rgb`} className="text-xs text-muted">
          {rgbText}
        </span>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-800" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
