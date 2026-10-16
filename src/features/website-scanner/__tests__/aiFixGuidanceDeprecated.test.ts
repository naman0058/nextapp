import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/accessibility/website/ai-fix-guidance/route";

describe("ai-fix-guidance deprecated route", () => {
  it("returns 410 without calling OpenAI", async () => {
    const res = await POST();
    expect(res.status).toBe(410);
    const body = await res.json();
    expect(body.code).toBe("AI_FIX_GUIDANCE_DEPRECATED");
  });
});
