export type AiRemediationErrorCode =
  | "AI_REMEDIATION_RATE_LIMITED"
  | "AI_REMEDIATION_TIMEOUT"
  | "AI_REMEDIATION_REFUSED"
  | "AI_REMEDIATION_INVALID_OUTPUT"
  | "AI_REMEDIATION_UNAVAILABLE"
  | "AI_REMEDIATION_FAILED"
  | "AI_REMEDIATION_PAYLOAD_TOO_LARGE"
  | "AI_REMEDIATION_SESSION_CAP";

export class AiRemediationError extends Error {
  readonly code: AiRemediationErrorCode;

  constructor(
    code: AiRemediationErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "AiRemediationError";
    this.code = code;
  }
}

export const AI_REMEDIATION_USER_MESSAGE =
  "AI remediation could not be generated for this item.";

export function userMessageForCode(code: AiRemediationErrorCode): string {
  switch (code) {
    case "AI_REMEDIATION_RATE_LIMITED":
      return "Too many AI remediation requests. Please wait before trying again.";
    case "AI_REMEDIATION_TIMEOUT":
      return AI_REMEDIATION_USER_MESSAGE;
    case "AI_REMEDIATION_REFUSED":
      return AI_REMEDIATION_USER_MESSAGE;
    case "AI_REMEDIATION_INVALID_OUTPUT":
      return AI_REMEDIATION_USER_MESSAGE;
    case "AI_REMEDIATION_UNAVAILABLE":
      return "AI remediation is not available in this environment.";
    case "AI_REMEDIATION_PAYLOAD_TOO_LARGE":
      return "The remediation request is too large. Reduce evidence and try again.";
    case "AI_REMEDIATION_SESSION_CAP":
      return "AI remediation limit reached for this session. Review existing guidance or start a new session.";
    case "AI_REMEDIATION_FAILED":
    default:
      return AI_REMEDIATION_USER_MESSAGE;
  }
}
