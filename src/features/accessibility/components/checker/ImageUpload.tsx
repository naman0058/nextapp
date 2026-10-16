"use client";

import { useId, useRef, type ChangeEvent, type DragEvent } from "react";
import { ACCEPTED_IMAGE_MIME_TYPES } from "@/constants";
import { MAX_IMAGE_SIZE_BYTES } from "@/features/accessibility/constants/thresholds";
import { PrivacyNotice } from "@/features/accessibility/components/checker/PrivacyNotice";
import { AppField } from "@/components/app/AppField";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
  fileName: string | null;
  previewUrl: string | null;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
  onError: (message: string) => void;
};

const ACCEPT = ACCEPTED_IMAGE_MIME_TYPES.join(",");

export function ImageUpload({
  fileName,
  previewUrl,
  onFileSelected,
  onRemove,
  onError,
}: ImageUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  function validateAndSelect(file: File) {
    const mime = file.type.toLowerCase();
    if (mime === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
      onError("SVG is not supported for upload in this tool.");
      return;
    }
    const allowed = ACCEPTED_IMAGE_MIME_TYPES as readonly string[];
    if (!allowed.includes(mime)) {
      onError("Unsupported file type. Use PNG, JPG, JPEG, or WEBP.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      onError("Maximum image size: 10 MB.");
      return;
    }
    onFileSelected(file);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
    e.target.value = "";
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSelect(file);
  }

  return (
    <AppField
      label="Image (optional)"
      htmlFor={inputId}
      hint="Used for alt-text checks, contrast sampling, and optional AI review. Maximum 10 MB."
    >
      <div
        className={cn(
          "rounded-2xl border-2 border-dashed border-border bg-gradient-to-br from-muted-bg to-white p-5 transition-colors",
          "hover:border-primary/30",
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT}
          onChange={handleInputChange}
          className="sr-only"
        />
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">
            ↑
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
            >
              Choose image file
            </Button>
            <p className="mt-2 text-xs text-muted">
              or drag and drop PNG, JPG, JPEG, or WEBP
            </p>
          </div>
        </div>

        {fileName && (
          <div className="mt-5 flex flex-wrap items-start gap-4 border-t border-border pt-5">
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview
              <img
                src={previewUrl}
                alt=""
                className="max-h-36 rounded-xl border border-border object-contain shadow-sm"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{fileName}</p>
              <Button type="button" variant="ghost" className="mt-2 px-0" onClick={onRemove}>
                Remove image
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3">
        <PrivacyNotice />
      </div>
    </AppField>
  );
}
