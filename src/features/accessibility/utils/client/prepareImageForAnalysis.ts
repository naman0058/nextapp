import { AI_ANALYSIS_MAX_LONG_EDGE } from "@/features/accessibility/constants/aiLimits";

export class ImagePrepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImagePrepError";
  }
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImagePrepError("Could not load image for analysis."));
    };
    img.src = url;
  });
}

export type PreparedImage = {
  blob: Blob;
  mimeType: string;
  fileName: string;
};

export async function prepareImageForAnalysis(
  file: File,
): Promise<PreparedImage> {
  if (
    file.type === "image/svg+xml" ||
    file.name.toLowerCase().endsWith(".svg")
  ) {
    throw new ImagePrepError("SVG is not supported for AI image analysis.");
  }

  const img = await loadImageFromFile(file);
  const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
  const scale =
    longEdge > AI_ANALYSIS_MAX_LONG_EDGE
      ? AI_ANALYSIS_MAX_LONG_EDGE / longEdge
      : 1;

  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new ImagePrepError("Could not prepare image for analysis.");
  }

  ctx.drawImage(img, 0, 0, width, height);

  const preferJpeg =
    file.type === "image/jpeg" || file.type === "image/jpg";
  const mimeType = preferJpeg ? "image/jpeg" : file.type || "image/png";
  const quality = mimeType === "image/jpeg" ? 0.88 : undefined;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new ImagePrepError("Could not prepare image for analysis."));
          return;
        }
        resolve(result);
      },
      mimeType,
      quality,
    );
  });

  const ext = mimeType.split("/")[1] ?? "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";

  return {
    blob,
    mimeType,
    fileName: `${baseName}-analysis.${ext}`,
  };
}
