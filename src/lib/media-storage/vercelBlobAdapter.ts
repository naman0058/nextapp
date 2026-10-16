import "server-only";

import { randomUUID } from "node:crypto";
import { del, get, list } from "@vercel/blob";
import {
  createMediaRefPathname,
  extensionForMime,
  isValidMediaRef,
} from "@/lib/media-storage/mediaRefUtils";
import type {
  CreateUploadAuthorizationInput,
  TemporaryFilePayload,
  TemporaryMediaStorage,
  UploadAuthorization,
} from "@/lib/media-storage/types";
import { isVercelBlobStorageConfigured } from "@/lib/media-storage/blobConfig";
import { VIDEO_TEMP_PATH_PREFIX } from "@/features/video/constants/videoLimits";

const UPLOAD_TTL_MS = 2 * 60 * 60 * 1000;

/** Pathnames authorized for client upload but not yet confirmed in blob store */
const pendingUploads = new Set<string>();

export class VercelBlobTemporaryMediaStorage implements TemporaryMediaStorage {
  isConfigured(): boolean {
    return isVercelBlobStorageConfigured();
  }

  async createUploadAuthorization(
    input: CreateUploadAuthorizationInput,
  ): Promise<UploadAuthorization> {
    const id = randomUUID();
    const ext = extensionForMime(input.contentType);
    const pathname = createMediaRefPathname(id, ext);
    pendingUploads.add(pathname);
    setTimeout(() => pendingUploads.delete(pathname), UPLOAD_TTL_MS);

    return {
      mediaRef: pathname,
      uploadUrl: "/api/accessibility/video/blob-upload",
      expiresAt: Date.now() + UPLOAD_TTL_MS,
    };
  }

  markUploadComplete(pathname: string): void {
    pendingUploads.delete(pathname);
  }

  validateReference(mediaRef: string): boolean {
    if (!isValidMediaRef(mediaRef)) return false;
    return true;
  }

  async getTemporaryFile(mediaRef: string): Promise<TemporaryFilePayload> {
    if (!this.validateReference(mediaRef)) {
      throw new Error("Invalid media reference.");
    }
    const result = await get(mediaRef, { access: "private" });
    if (!result || !("stream" in result)) {
      throw new Error("Failed to read temporary media.");
    }
    if (!result.stream) {
      throw new Error("Failed to read temporary media.");
    }
    const reader = result.stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
    const contentType =
      result.headers.get("content-type") ?? "application/octet-stream";
    return {
      buffer,
      contentType,
      pathname: mediaRef,
    };
  }

  async deleteTemporaryFile(mediaRef: string): Promise<void> {
    if (!isValidMediaRef(mediaRef)) return;
    try {
      await del(mediaRef);
    } catch {
      /* best-effort */
    }
    pendingUploads.delete(mediaRef);
  }

  async cleanupOrphaned(maxAgeMs: number): Promise<{ deleted: number }> {
    const cutoff = Date.now() - maxAgeMs;
    let deleted = 0;
    let cursor: string | undefined;
    do {
      const page = await list({
        prefix: VIDEO_TEMP_PATH_PREFIX,
        cursor,
      });
      for (const blob of page.blobs) {
        const uploadedAt = new Date(blob.uploadedAt).getTime();
        if (uploadedAt < cutoff) {
          await del(blob.url);
          deleted += 1;
        }
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return { deleted };
  }

  isPendingPathname(pathname: string): boolean {
    return pendingUploads.has(pathname);
  }
}

let blobAdapter: VercelBlobTemporaryMediaStorage | null = null;

export function getVercelBlobAdapter(): VercelBlobTemporaryMediaStorage {
  if (!blobAdapter) blobAdapter = new VercelBlobTemporaryMediaStorage();
  return blobAdapter;
}
