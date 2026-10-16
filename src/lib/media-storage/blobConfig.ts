import "server-only";

/** Optional legacy token for local or non-Vercel deployments. Not required on Vercel OIDC. */
export function hasLegacyBlobReadWriteToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function isRunningOnVercel(): boolean {
  return (
    process.env.VERCEL === "1" ||
    process.env.VERCEL === "true" ||
    Boolean(process.env.VERCEL_ENV?.trim())
  );
}

/**
 * Vercel injects BLOB_STORE_ID (and related OIDC config) when a private Blob store
 * is connected to the project. @vercel/blob authenticates via OIDC — no manual token.
 */
export function isVercelBlobOidcConfigured(): boolean {
  if (!isRunningOnVercel()) return false;
  return Boolean(process.env.BLOB_STORE_ID?.trim());
}

/** Server-side Vercel Blob temporary video storage is available. */
export function isVercelBlobStorageConfigured(): boolean {
  return hasLegacyBlobReadWriteToken() || isVercelBlobOidcConfigured();
}
