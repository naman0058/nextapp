import type { Metadata } from "next";

/**
 * Production search indexing: true when built for production AND either
 * deployed to Vercel production or explicitly opted in (local prod smoke tests).
 */
export function shouldAllowSearchIndexing(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return false;
  }
  if (process.env.SITE_INDEXABLE === "1" || process.env.SITE_INDEXABLE === "true") {
    return true;
  }
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === "production") {
    return true;
  }
  if (vercelEnv === "preview" || vercelEnv === "development") {
    return false;
  }
  // Non-Vercel production host: require explicit SITE_INDEXABLE=1
  return false;
}

export function getDefaultRobotsMetadata(): Metadata["robots"] {
  if (!shouldAllowSearchIndexing()) {
    return { index: false, follow: false };
  }
  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

export function getSiteVerificationMetadata(): Metadata["verification"] {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const bing = process.env.BING_SITE_VERIFICATION?.trim();
  if (!google && !bing) return undefined;
  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
  };
}
