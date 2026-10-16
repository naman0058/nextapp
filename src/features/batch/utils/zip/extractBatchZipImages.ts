import JSZip from "jszip";
import {
  BATCH_ZIP_REJECT_EXTENSIONS,
  MAX_BATCH_EXTRACTED_IMAGE_BYTES,
  MAX_BATCH_IMAGE_COUNT,
  MAX_BATCH_ZIP_SIZE_BYTES,
} from "@/features/batch/constants/batchLimits";

export type ExtractedZipImage = {
  zipPath: string;
  baseName: string;
  file: File;
};

export type ExtractZipResult =
  | { ok: true; images: ExtractedZipImage[] }
  | { ok: false; error: string };

function isSafeZipPath(path: string): boolean {
  const normalized = path.replace(/\\/g, "/");
  if (normalized.startsWith("/") || normalized.includes("..")) return false;
  return true;
}

function extensionOf(path: string): string {
  const base = path.split("/").pop() ?? path;
  const idx = base.lastIndexOf(".");
  return idx >= 0 ? base.slice(idx).toLowerCase() : "";
}

function mimeFromExt(ext: string): string | null {
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return null;
}

export async function extractBatchZipImages(
  zipFile: File,
): Promise<ExtractZipResult> {
  if (zipFile.size > MAX_BATCH_ZIP_SIZE_BYTES) {
    return {
      ok: false,
      error: `ZIP file exceeds ${MAX_BATCH_ZIP_SIZE_BYTES / (1024 * 1024)} MB limit.`,
    };
  }

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(zipFile);
  } catch {
    return { ok: false, error: "Could not read ZIP file." };
  }

  const images: ExtractedZipImage[] = [];
  let extractedBytes = 0;

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    if (!isSafeZipPath(path)) continue;

    const ext = extensionOf(path);
    if (BATCH_ZIP_REJECT_EXTENSIONS.has(ext)) continue;

    const mime = mimeFromExt(ext);
    if (!mime) continue;
    const allowed =
      mime === "image/png" ||
      mime === "image/jpeg" ||
      mime === "image/webp";
    if (!allowed) continue;

    if (images.length >= MAX_BATCH_IMAGE_COUNT) {
      return {
        ok: false,
        error: `ZIP contains more than ${MAX_BATCH_IMAGE_COUNT} images.`,
      };
    }

    const buf = await entry.async("uint8array");
    extractedBytes += buf.byteLength;
    if (extractedBytes > MAX_BATCH_EXTRACTED_IMAGE_BYTES) {
      return {
        ok: false,
        error:
          "Extracted image data exceeds the safe limit for this browser session.",
      };
    }

    const baseName = path.split("/").pop() ?? path;
    const file = new File([new Uint8Array(buf)], baseName, { type: mime });
    images.push({ zipPath: path, baseName, file });
  }

  return { ok: true, images };
}
