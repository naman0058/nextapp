import "server-only";

import { getDevDirectUploadAdapter } from "@/lib/media-storage/devDirectUploadAdapter";
import { getVercelBlobAdapter } from "@/lib/media-storage/vercelBlobAdapter";
import type { TemporaryMediaStorage } from "@/lib/media-storage/types";

export type { TemporaryMediaStorage, UploadAuthorization } from "@/lib/media-storage/types";
export { isValidMediaRef } from "@/lib/media-storage/mediaRefUtils";

export function getTemporaryMediaStorage(): TemporaryMediaStorage {
  const blob = getVercelBlobAdapter();
  if (blob.isConfigured()) {
    return blob;
  }
  return getDevDirectUploadAdapter();
}

export function isVideoProcessingConfigured(): boolean {
  const blob = getVercelBlobAdapter();
  if (blob.isConfigured()) return true;
  const dev = getDevDirectUploadAdapter();
  return dev.isConfigured();
}

export function getActiveStorageKind(): "vercel_blob" | "dev" | "none" {
  const blob = getVercelBlobAdapter();
  if (blob.isConfigured()) return "vercel_blob";
  const dev = getDevDirectUploadAdapter();
  if (dev.isConfigured()) return "dev";
  return "none";
}
