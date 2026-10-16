import "server-only";

import {
  AI_RATE_LIMIT_MAX_REQUESTS,
  AI_RATE_LIMIT_WINDOW_MS,
  VIDEO_TRANSCRIBE_RATE_LIMIT_MAX_REQUESTS,
  VIDEO_TRANSCRIBE_RATE_LIMIT_WINDOW_MS,
  VIDEO_VISUAL_RATE_LIMIT_MAX_REQUESTS,
  VIDEO_VISUAL_RATE_LIMIT_WINDOW_MS,
  WEBSITE_AI_RATE_LIMIT_MAX_REQUESTS,
  WEBSITE_AI_RATE_LIMIT_WINDOW_MS,
  AI_REMEDIATION_RATE_LIMIT_MAX_REQUESTS,
  AI_REMEDIATION_RATE_LIMIT_WINDOW_MS,
  WEBSITE_SCAN_RATE_LIMIT_MAX_REQUESTS,
  WEBSITE_SCAN_RATE_LIMIT_WINDOW_MS,
  VISUAL_LOCATOR_IMAGE_RATE_LIMIT_MAX_REQUESTS,
  VISUAL_LOCATOR_IMAGE_RATE_LIMIT_WINDOW_MS,
  VISUAL_LOCATOR_TOKEN_RATE_LIMIT_MAX_REQUESTS,
  VISUAL_LOCATOR_TOKEN_RATE_LIMIT_WINDOW_MS,
} from "@/features/accessibility/constants/aiLimits";
import type { RateLimiter, RateLimitResult } from "@/lib/rateLimit/types";

/**
 * Best-effort in-memory limiter for development/single-instance use.
 * Not reliable on distributed serverless without a durable store (e.g. Upstash).
 */
export class BestEffortMemoryLimiter implements RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private windowMs = AI_RATE_LIMIT_WINDOW_MS,
    private maxRequests = AI_RATE_LIMIT_MAX_REQUESTS,
  ) {}

  check(key: string, cost = 1): RateLimitResult {
    const units = Math.max(1, Math.floor(cost));
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const timestamps = (this.hits.get(key) ?? []).filter((t) => t > windowStart);

    if (timestamps.length + units > this.maxRequests) {
      const retryAfterMs = (timestamps[0] ?? now) + this.windowMs - now;
      return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1000) };
    }

    for (let i = 0; i < units; i += 1) {
      timestamps.push(now);
    }
    this.hits.set(key, timestamps);
    return { allowed: true };
  }
}

const globalLimiter = new BestEffortMemoryLimiter();
const videoTranscribeLimiter = new BestEffortMemoryLimiter(
  VIDEO_TRANSCRIBE_RATE_LIMIT_WINDOW_MS,
  VIDEO_TRANSCRIBE_RATE_LIMIT_MAX_REQUESTS,
);
const videoVisualLimiter = new BestEffortMemoryLimiter(
  VIDEO_VISUAL_RATE_LIMIT_WINDOW_MS,
  VIDEO_VISUAL_RATE_LIMIT_MAX_REQUESTS,
);
const websiteScanLimiter = new BestEffortMemoryLimiter(
  WEBSITE_SCAN_RATE_LIMIT_WINDOW_MS,
  WEBSITE_SCAN_RATE_LIMIT_MAX_REQUESTS,
);
const websiteAiLimiter = new BestEffortMemoryLimiter(
  WEBSITE_AI_RATE_LIMIT_WINDOW_MS,
  WEBSITE_AI_RATE_LIMIT_MAX_REQUESTS,
);
const aiRemediationLimiter = new BestEffortMemoryLimiter(
  AI_REMEDIATION_RATE_LIMIT_WINDOW_MS,
  AI_REMEDIATION_RATE_LIMIT_MAX_REQUESTS,
);
const visualLocatorTokenLimiter = new BestEffortMemoryLimiter(
  VISUAL_LOCATOR_TOKEN_RATE_LIMIT_WINDOW_MS,
  VISUAL_LOCATOR_TOKEN_RATE_LIMIT_MAX_REQUESTS,
);
const visualLocatorImageLimiter = new BestEffortMemoryLimiter(
  VISUAL_LOCATOR_IMAGE_RATE_LIMIT_WINDOW_MS,
  VISUAL_LOCATOR_IMAGE_RATE_LIMIT_MAX_REQUESTS,
);

export function getAiImageRateLimiter(): RateLimiter {
  return globalLimiter;
}

export function getVideoTranscribeRateLimiter(): RateLimiter {
  return videoTranscribeLimiter;
}

export function getVideoVisualRateLimiter(): RateLimiter {
  return videoVisualLimiter;
}

export function getWebsiteScanRateLimiter(): RateLimiter {
  return websiteScanLimiter;
}

export function getWebsiteAiRateLimiter(): RateLimiter {
  return websiteAiLimiter;
}

export function getAiRemediationRateLimiter(): RateLimiter {
  return aiRemediationLimiter;
}

export function getVisualLocatorTokenRateLimiter(): RateLimiter {
  return visualLocatorTokenLimiter;
}

export function getVisualLocatorImageRateLimiter(): RateLimiter {
  return visualLocatorImageLimiter;
}
