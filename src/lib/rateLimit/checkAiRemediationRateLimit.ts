import "server-only";

import { getAiRemediationRateLimiter } from "@/lib/rateLimit/bestEffortMemoryLimiter";
import type { RateLimitResult } from "@/lib/rateLimit/types";

export function checkAiRemediationRateLimit(clientKey: string): RateLimitResult {
  return getAiRemediationRateLimiter().check(clientKey);
}
