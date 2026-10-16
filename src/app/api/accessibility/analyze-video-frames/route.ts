import { NextResponse } from "next/server";
import { isOpenAiConfigured } from "@/lib/openai/config";
import { OpenAiConfigError } from "@/lib/openai/client";
import { checkVideoVisualRateLimit } from "@/lib/rateLimit/checkAIRateLimit";
import { parseAnalyzeVideoFramesRequest } from "@/features/video/server/parseAnalyzeVideoFramesRequest";
import { analyzeVideoFramesWithOpenAI } from "@/features/video/server/analyzeVideoFramesWithOpenAI";
import { VideoTranscriptionError } from "@/features/video/server/videoTranscriptionError";

function noStoreJson(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  if (!isOpenAiConfigured()) {
    return noStoreJson(
      {
        error:
          "Visual review is not configured. Set OPENAI_API_KEY on the server.",
      },
      503,
    );
  }

  const clientKey = getClientKey(request);
  const limit = checkVideoVisualRateLimit(clientKey);
  if (!limit.allowed) {
    return noStoreJson(
      {
        error: "Too many requests. Please wait before trying again.",
        retryAfterMs: limit.retryAfterMs,
      },
      429,
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return noStoreJson({ error: "Invalid JSON body." }, 400);
  }

  const parsed = parseAnalyzeVideoFramesRequest(json);
  if (!parsed.ok) {
    return noStoreJson({ error: parsed.message }, parsed.status);
  }

  try {
    const review = await analyzeVideoFramesWithOpenAI(parsed.body);
    return noStoreJson(review, 200);
  } catch (error) {
    if (error instanceof OpenAiConfigError) {
      return noStoreJson({ error: "Visual review is not configured." }, 503);
    }
    if (error instanceof VideoTranscriptionError) {
      const status = error.code === "timeout" ? 504 : 502;
      return noStoreJson(
        {
          error:
            "Visual review could not be completed. Your transcript and captions are still available.",
        },
        status,
      );
    }
    return noStoreJson(
      {
        error:
          "Visual review could not be completed. Your transcript and captions are still available.",
      },
      502,
    );
  }
}

export async function GET() {
  return noStoreJson({ error: "Method not allowed." }, 405);
}
