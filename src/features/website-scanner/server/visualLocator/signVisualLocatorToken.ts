import "server-only";

import { createHmac } from "node:crypto";
import type { VisualLocatorPayload } from "@/features/website-scanner/types/visualLocator";
import { getVisualLocatorSigningSecret } from "@/features/website-scanner/server/visualLocator/getVisualLocatorSigningSecret";

function canonicalPayload(payload: VisualLocatorPayload): string {
  const clone = { ...payload };
  return JSON.stringify(clone);
}

export function signVisualLocatorToken(payload: VisualLocatorPayload): string {
  const secret = getVisualLocatorSigningSecret();
  if (!secret) {
    throw new Error("VISUAL_LOCATOR_SIGNING_SECRET is not configured.");
  }
  const body = canonicalPayload(payload);
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  const bodyB64 = Buffer.from(body, "utf8").toString("base64url");
  return `${bodyB64}.${sig}`;
}
