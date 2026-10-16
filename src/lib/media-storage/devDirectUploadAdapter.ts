import "server-only";

import { randomUUID } from "node:crypto";
import type { AcceptedVideoMimeType } from "@/features/video/constants/videoLimits";
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

type DevEntry = {
  buffer: Buffer;
  contentType: string;
  pathname: string;
  createdAt: number;
};

const store = new Map<string, DevEntry>();

const UPLOAD_TTL_MS = 2 * 60 * 60 * 1000;

export class DevDirectUploadAdapter implements TemporaryMediaStorage {
  isConfigured(): boolean {
    if (process.env.NODE_ENV === "production") return false;
    return process.env.VIDEO_DEV_DIRECT_UPLOAD !== "0";
  }

  async createUploadAuthorization(
    input: CreateUploadAuthorizationInput,
  ): Promise<UploadAuthorization> {
    const id = randomUUID();
    const ext = extensionForMime(input.contentType);
    const pathname = createMediaRefPathname(id, ext);
    return {
      mediaRef: pathname,
      uploadUrl: "",
      devDirectUploadPath: "/api/accessibility/video/dev-upload",
      expiresAt: Date.now() + UPLOAD_TTL_MS,
    };
  }

  validateReference(mediaRef: string): boolean {
    return isValidMediaRef(mediaRef) && store.has(mediaRef);
  }

  registerUpload(
    mediaRef: string,
    buffer: Buffer,
    contentType: AcceptedVideoMimeType,
  ): void {
    if (!isValidMediaRef(mediaRef)) {
      throw new Error("Invalid media reference.");
    }
    store.set(mediaRef, {
      buffer,
      contentType,
      pathname: mediaRef,
      createdAt: Date.now(),
    });
  }

  async getTemporaryFile(mediaRef: string): Promise<TemporaryFilePayload> {
    const entry = store.get(mediaRef);
    if (!entry) {
      throw new Error("Temporary media not found.");
    }
    return {
      buffer: entry.buffer,
      contentType: entry.contentType,
      pathname: entry.pathname,
    };
  }

  async deleteTemporaryFile(mediaRef: string): Promise<void> {
    store.delete(mediaRef);
  }

  async cleanupOrphaned(maxAgeMs: number): Promise<{ deleted: number }> {
    const now = Date.now();
    let deleted = 0;
    for (const [key, entry] of store.entries()) {
      if (now - entry.createdAt > maxAgeMs) {
        store.delete(key);
        deleted += 1;
      }
    }
    return { deleted };
  }
}

let devAdapter: DevDirectUploadAdapter | null = null;

export function getDevDirectUploadAdapter(): DevDirectUploadAdapter {
  if (!devAdapter) devAdapter = new DevDirectUploadAdapter();
  return devAdapter;
}
