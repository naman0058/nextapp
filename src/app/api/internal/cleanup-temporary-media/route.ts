import { NextResponse } from "next/server";
import { getTemporaryMediaStorage } from "@/lib/media-storage";

const DEFAULT_MAX_AGE_MS = 2 * 60 * 60 * 1000;

function getMaxAgeMs(): number {
  const raw = process.env.MEDIA_CLEANUP_MAX_AGE_MS?.trim();
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return DEFAULT_MAX_AGE_MS;
}

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const storage = getTemporaryMediaStorage();
  const result = await storage.cleanupOrphaned(getMaxAgeMs());

  return NextResponse.json(
    { deleted: result.deleted },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
