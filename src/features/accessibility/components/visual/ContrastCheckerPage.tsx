"use client";

import { useEffect, useState } from "react";
import { VisualAccessibilityPanel } from "@/features/accessibility/components/visual/VisualAccessibilityPanel";

export function ContrastCheckerPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleImage(file: File, url: string) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(url);
  }

  function handleRemove() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl(null);
  }

  return (
    <VisualAccessibilityPanel
      mode="standalone"
      imageFile={imageFile}
      imagePreviewUrl={previewUrl}
      standaloneFileName={imageFile?.name ?? null}
      onStandaloneImage={handleImage}
      onStandaloneRemoveImage={handleRemove}
    />
  );
}
