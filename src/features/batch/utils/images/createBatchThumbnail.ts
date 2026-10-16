import { BATCH_THUMBNAIL_MAX_EDGE } from "@/features/batch/constants/batchLimits";

export async function createBatchThumbnail(file: File): Promise<string | null> {
  if (typeof document === "undefined") return null;
  try {
    const url = URL.createObjectURL(file);
    const img = await loadImage(url);
    URL.revokeObjectURL(url);
    const canvas = document.createElement("canvas");
    const scale = Math.min(
      BATCH_THUMBNAIL_MAX_EDGE / img.width,
      BATCH_THUMBNAIL_MAX_EDGE / img.height,
      1,
    );
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.72);
  } catch {
    return null;
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("thumbnail failed"));
    img.src = url;
  });
}
