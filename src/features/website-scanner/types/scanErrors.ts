export type WebsiteScanErrorCode =
  | "INVALID_URL"
  | "BLOCKED_DESTINATION"
  | "DNS_FAILURE"
  | "ROBOTS_BLOCKED"
  | "NAVIGATION_TIMEOUT"
  | "PAGE_TOO_LARGE"
  | "TOO_MANY_REQUESTS"
  | "UNSUPPORTED_RESPONSE"
  | "BROWSER_ERROR"
  | "AXE_ERROR"
  | "RATE_LIMITED"
  | "SCANNER_UNAVAILABLE"
  | "ORIGIN_MISMATCH"
  | "SITEMAP_UNSUPPORTED"
  | "SITEMAP_FETCH_FAILED"
  | "SITEMAP_TOO_LARGE"
  | "SITEMAP_INVALID"
  | "SITEMAP_NOT_FOUND"
  | "BATCH_INVALID"
  | "BATCH_LIMIT"
  | "VISUAL_LOCATOR_UNAVAILABLE"
  | "VISUAL_LOCATOR_INVALID_TOKEN"
  | "VISUAL_LOCATOR_TOKEN_EXPIRED"
  | "ELEMENT_NOT_FOUND"
  | "ELEMENT_NOT_VISIBLE"
  | "UNSUPPORTED_TARGET";

export class WebsiteScanError extends Error {
  readonly code: WebsiteScanErrorCode;
  readonly userMessage: string;

  constructor(code: WebsiteScanErrorCode, userMessage: string) {
    super(userMessage);
    this.name = "WebsiteScanError";
    this.code = code;
    this.userMessage = userMessage;
  }
}
