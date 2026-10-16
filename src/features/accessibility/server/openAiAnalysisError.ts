export class OpenAiAnalysisError extends Error {
  constructor(
    message: string,
    readonly code: "upstream" | "malformed" | "timeout" = "upstream",
  ) {
    super(message);
    this.name = "OpenAiAnalysisError";
  }
}
