const LOOPBACK_BYPASS_ENV = "WEBSITE_SCANNER_TEST_ALLOW_LOOPBACK";

/** Fail fast if test bypass is enabled in production. */
export function assertLoopbackBypassDisabledInProduction(): void {
  if (
    process.env.NODE_ENV === "production" &&
    process.env[LOOPBACK_BYPASS_ENV]?.trim() === "1"
  ) {
    throw new Error(
      `${LOOPBACK_BYPASS_ENV} must not be enabled in production.`,
    );
  }
}

/** Test-only: allow loopback targets for fixture servers. Never in production. */
export function isLoopbackTestBypassEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.WEBSITE_SCANNER_TEST_ALLOW_LOOPBACK === "1";
}

export function allowLoopbackForTests(hostname: string): boolean {
  if (!isLoopbackTestBypassEnabled()) return false;
  const h = hostname.toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "::1";
}
