import { timingSafeEqual } from "node:crypto";

const BEARER_PREFIX = "Bearer ";

/**
 * Constant-time Bearer comparison. Never log tokens.
 */
export function verifyScannerBearerToken(
  authorizationHeader: string | undefined,
  expectedToken: string | undefined,
): boolean {
  const expected = expectedToken?.trim();
  if (!expected) return false;
  if (!authorizationHeader?.startsWith(BEARER_PREFIX)) return false;

  const provided = authorizationHeader.slice(BEARER_PREFIX.length).trim();
  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);

  if (providedBuf.length !== expectedBuf.length) {
    timingSafeEqual(expectedBuf, expectedBuf);
    return false;
  }

  return timingSafeEqual(providedBuf, expectedBuf);
}

/** @deprecated use verifyScannerBearerToken — kept for existing tests */
export function isScannerRequestAuthorized(
  authorizationHeader: string | undefined,
  token: string | undefined,
): boolean {
  return verifyScannerBearerToken(authorizationHeader, token);
}
