import type { ScanViewport } from "@/features/website-scanner/constants/viewports";

/** JSON-serializable axe target (string or nested arrays). */
export type AxeTargetRepresentation = unknown;

export type VisualLocatorPayloadVersion = 1;

export type VisualLocatorPayload = {
  version: VisualLocatorPayloadVersion;
  url: string;
  viewport: ScanViewport;
  ruleId: string;
  issueFingerprint: string;
  target: AxeTargetRepresentation;
  selectorLabel: string;
  domSignature?: string;
  occurrenceIndex: number;
  occurrenceTotal: number;
  ruleTitle: string;
  issuedAt: number;
  expiresAt: number;
};

export type VisualLocatorMatch = "exact" | "strong";

export type WebsiteVisualLocatorRequest = {
  url: string;
  viewport: ScanViewport;
  ruleId: string;
  target: AxeTargetRepresentation;
  selectorLabel: string;
  domSignature?: string;
  occurrenceIndex: number;
  ruleTitle: string;
};

export type WebsiteVisualLocatorResult = {
  image: Buffer;
  contentType: "image/webp" | "image/png";
  match: VisualLocatorMatch;
  occurrenceIndex: number;
};

export type VisualLocatorErrorCode =
  | "VISUAL_LOCATOR_UNAVAILABLE"
  | "VISUAL_LOCATOR_INVALID_TOKEN"
  | "VISUAL_LOCATOR_TOKEN_EXPIRED"
  | "ELEMENT_NOT_FOUND"
  | "ELEMENT_NOT_VISIBLE"
  | "UNSUPPORTED_TARGET"
  | "VISUAL_LOCATOR_RATE_LIMITED";

export type VisualIssueEvidenceStatus =
  | "available"
  | "not_requested"
  | "loading"
  | "element_not_found"
  | "element_not_visible"
  | "unsupported_target"
  | "error";

export type VisualIssueEvidence = {
  status: VisualIssueEvidenceStatus;
  occurrenceIndex: number;
  occurrenceTotal: number;
  viewportId: "desktop" | "mobile";
  generatedAt?: string;
  locatorMatch?: VisualLocatorMatch;
  imageObjectUrl?: string;
  limitation?: string;
  pageUrl: string;
  ruleId: string;
  selectorLabel: string;
  htmlSnippet?: string;
};
