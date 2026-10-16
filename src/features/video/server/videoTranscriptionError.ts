export class VideoTranscriptionError extends Error {
  constructor(
    message: string,
    readonly code: "timeout" | "upstream" | "malformed" | "config",
  ) {
    super(message);
    this.name = "VideoTranscriptionError";
  }
}
