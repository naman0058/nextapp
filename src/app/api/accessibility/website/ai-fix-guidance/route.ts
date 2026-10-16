import { NextResponse } from "next/server";

function noStoreJson(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/** @deprecated AI-R2 — use POST /api/accessibility/ai-remediation. This route no longer calls OpenAI. */
export async function POST() {
  return noStoreJson(
    {
      error:
        "Website AI fix guidance has moved to the shared AI remediation API. Use POST /api/accessibility/ai-remediation.",
      code: "AI_FIX_GUIDANCE_DEPRECATED",
    },
    410,
  );
}
