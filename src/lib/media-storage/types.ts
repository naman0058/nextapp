import type { AcceptedVideoMimeType } from "@/features/video/constants/videoLimits";

export type UploadAuthorization = {
  /** Opaque reference passed to transcribe route — not a public URL */
  mediaRef: string;
  /** Client PUT target */
  uploadUrl: string;
  /** When using dev direct upload, client POSTs body here instead */
  devDirectUploadPath?: string;
  expiresAt: number;
};

export type CreateUploadAuthorizationInput = {
  contentType: AcceptedVideoMimeType;
  maxBytes: number;
};

export type TemporaryFilePayload = {
  buffer: Buffer;
  contentType: string;
  pathname: string;
};

export interface TemporaryMediaStorage {
  isConfigured(): boolean;
  createUploadAuthorization(
    input: CreateUploadAuthorizationInput,
  ): Promise<UploadAuthorization>;
  validateReference(mediaRef: string): boolean;
  getTemporaryFile(mediaRef: string): Promise<TemporaryFilePayload>;
  deleteTemporaryFile(mediaRef: string): Promise<void>;
  cleanupOrphaned(maxAgeMs: number): Promise<{ deleted: number }>;
}
