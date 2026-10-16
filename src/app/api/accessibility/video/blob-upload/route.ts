import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getMaxVideoFileSizeBytes } from "@/features/video/constants/videoLimits";
import { getActiveStorageKind } from "@/lib/media-storage";
import { getVercelBlobAdapter } from "@/lib/media-storage/vercelBlobAdapter";
import { isValidMediaRef } from "@/lib/media-storage/mediaRefUtils";
import { ACCEPTED_VIDEO_MIME_TYPES } from "@/features/video/constants/videoLimits";

function noStoreJson(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  if (getActiveStorageKind() !== "vercel_blob") {
    return noStoreJson({ error: "Blob upload is not available." }, 404);
  }

  const body = (await request.json()) as HandleUploadBody;
  const blobAdapter = getVercelBlobAdapter();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!isValidMediaRef(pathname)) {
          throw new Error("Invalid upload path.");
        }
        if (!blobAdapter.isPendingPathname(pathname)) {
          throw new Error("Upload not authorized.");
        }
        return {
          allowedContentTypes: [...ACCEPTED_VIDEO_MIME_TYPES],
          maximumSizeInBytes: getMaxVideoFileSizeBytes(),
          pathname,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({ pathname }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        if (isValidMediaRef(blob.pathname)) {
          blobAdapter.markUploadComplete(blob.pathname);
        }
      },
    });
    return NextResponse.json(jsonResponse);
  } catch {
    return noStoreJson({ error: "Upload authorization failed." }, 400);
  }
}

export async function GET() {
  return noStoreJson({ error: "Method not allowed." }, 405);
}
