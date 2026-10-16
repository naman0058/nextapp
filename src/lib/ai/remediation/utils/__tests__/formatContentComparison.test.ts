import { describe, expect, it } from "vitest";
import { formatContentComparison } from "@/lib/ai/remediation/utils/formatContentComparison";

describe("formatContentComparison", () => {
  it("detects changed lines", () => {
    const lines = formatContentComparison("Hello", "Hello world");
    expect(lines.some((l) => l.kind === "changed" || l.kind === "added")).toBe(true);
  });
});
