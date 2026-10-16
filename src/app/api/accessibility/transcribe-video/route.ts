import { NextResponse } from "next/server";
import { isOpenAiConfigured } from "@/lib/openai/config";
import { OpenAiConfigError } from "@/lib/openai/client";
import { checkVideoTranscribeRateLimit } from "@/lib/rateLimit/checkAIRateLimit";
import {
  getTemporaryMediaStorage,
  isVideoProcessingConfigured,
} from "@/lib/media-storage";
import { isValidMediaRef } from "@/lib/media-storage/mediaRefUtils";
import { parseTranscribeVideoRequest } from "@/features/video/server/parseTranscribeVideoRequest";
import { transcribeVideoWithOpenAI } from "@/features/video/server/transcribeVideoWithOpenAI";
import { VideoTranscriptionError } from "@/features/video/server/videoTranscriptionError";
import { getDevDirectUploadAdapter } from "@/lib/media-storage/devDirectUploadAdapter";
import { getActiveStorageKind } from "@/lib/media-storage";

export const maxDuration = 300;

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

function basenameFromRef(mediaRef: string): string {
  const parts = mediaRef.split("/");
  return parts[parts.length - 1] ?? "video.mp4";
}

export async function POST(request: Request) {
  const started = Date.now();

  if (!isVideoProcessingConfigured()) {
    return noStoreJson(
      { error: "Video processing is not configured on this deployment." },
      503,
    );
  }

  if (!isOpenAiConfigured()) {
    return noStoreJson(
      {
        error:
          "Transcription is not configured. Set OPENAI_API_KEY on the server.",
      },
      503,
    );
  }

  const clientKey = getClientKey(request);
  const limit = checkVideoTranscribeRateLimit(clientKey);
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

  const parsed = parseTranscribeVideoRequest(json);
  if (!parsed.ok) {
    return noStoreJson({ error: parsed.message }, parsed.status);
  }

  const { mediaRef, detectSpeakers, language, vocabularyHints } = parsed.body;
  const storage = getTemporaryMediaStorage();

  if (!isValidMediaRef(mediaRef)) {
    return noStoreJson({ error: "Invalid media reference." }, 400);
  }

  if (getActiveStorageKind() === "dev") {
    const dev = getDevDirectUploadAdapter();
    if (!dev.validateReference(mediaRef)) {
      return noStoreJson({ error: "Upload not found. Upload the video first." }, 400);
    }
  }

  try {
    const file = await storage.getTemporaryFile(mediaRef);
    const result = await transcribeVideoWithOpenAI({
      buffer: file.buffer,
      filename: basenameFromRef(mediaRef),
      mimeType: file.contentType,
      detectSpeakers: detectSpeakers ?? false,
      language,
      vocabularyHints,
    });

    const durationMs = Date.now() - started;
    console.info("[transcribe-video] success", {
      durationMs,
      mode: result.mode,
    });

    return noStoreJson(result, 200);
  } catch (error) {
    const durationMs = Date.now() - started;
    console.info("[transcribe-video] error", { durationMs });

    if (error instanceof OpenAiConfigError) {
      return noStoreJson({ error: "Transcription is not configured." }, 503);
    }
    if (error instanceof VideoTranscriptionError) {
      const status = error.code === "timeout" ? 504 : 502;
      return noStoreJson(
        {
          error:
            "Transcription could not be completed. Please try again.",
        },
        status,
      );
    }
    return noStoreJson(
      {
        error: "Transcription could not be completed. Please try again.",
      },
      502,
    );
  } finally {
    try {
      await storage.deleteTemporaryFile(mediaRef);
    } catch {
      /* orphan cleanup handles failures */
    }
  }
}

export async function GET() {
  return noStoreJson({ error: "Method not allowed." }, 405);
}
