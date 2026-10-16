export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterMs: number };

export interface RateLimiter {
  /** Each request consumes `cost` units against the window budget (default 1). */
  check(key: string, cost?: number): RateLimitResult;
}
