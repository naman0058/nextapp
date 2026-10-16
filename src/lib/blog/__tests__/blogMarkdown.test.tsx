import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BlogMarkdown } from "@/features/blog/components/BlogMarkdown";

describe("BlogMarkdown", () => {
  it("strips script tags and unsafe links", () => {
    const html = renderToStaticMarkup(
      <BlogMarkdown
        content={'# Hello\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))'}
      />,
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("javascript:");
  });
});
