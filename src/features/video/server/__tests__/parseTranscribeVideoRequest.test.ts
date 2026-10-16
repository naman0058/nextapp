import { describe, expect, it } from "vitest";
import { parseTranscribeVideoRequest } from "@/features/video/server/parseTranscribeVideoRequest";

describe("parseTranscribeVideoRequest", () => {
  it("accepts valid media ref", () => {
    const ref = "tmp/video/550e8400-e29b-41d4-a716-446655440000.mp4";
    const result = parseTranscribeVideoRequest({ mediaRef: ref });
    expect(result.ok).toBe(true);
  });

  it("rejects URLs (SSRF)", () => {
    const result = parseTranscribeVideoRequest({
      mediaRef: "http://localhost/tmp/video/evil.mp4",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects invalid path", () => {
    const result = parseTranscribeVideoRequest({ mediaRef: "uploads/user.mp4" });
    expect(result.ok).toBe(false);
  });
});
