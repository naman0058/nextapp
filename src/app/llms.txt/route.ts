import { buildLlmsTxt } from "@/lib/seo/buildLlmsTxt";

export function GET() {
  const body = buildLlmsTxt();
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
