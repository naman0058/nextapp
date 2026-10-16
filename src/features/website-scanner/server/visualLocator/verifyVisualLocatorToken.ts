import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { VisualLocatorPayload } from "@/features/website-scanner/types/visualLocator";
import { getVisualLocatorSigningSecret } from "@/features/website-scanner/server/visualLocator/getVisualLocatorSigningSecret";

export type VerifyTokenResult =
  | { ok: true; payload: VisualLocatorPayload }
  | { ok: false; reason: "missing_secret" | "malformed" | "bad_signature" | "expired" | "bad_version" };

export function verifyVisualLocatorToken(token: string): VerifyTokenResult {
  const secret = getVisualLocatorSigningSecret();
  if (!secret) return { ok: false, reason: "missing_secret" };

  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { ok: false, reason: "malformed" };
  }

  let body: string;
  try {
    body = Buffer.from(parts[0], "base64url").toString("utf8");
  } catch {
    return { ok: false, reason: "malformed" };
  }

  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(parts[1]);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, reason: "bad_signature" };
    }
  } catch {
    return { ok: false, reason: "bad_signature" };
  }

  let payload: VisualLocatorPayload;
  try {
    payload = JSON.parse(body) as VisualLocatorPayload;
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (payload.version !== 1) return { ok: false, reason: "bad_version" };
  if (typeof payload.expiresAt !== "number" || Date.now() > payload.expiresAt) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, payload };
}
