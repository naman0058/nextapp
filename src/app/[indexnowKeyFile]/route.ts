import { getIndexNowKey, getIndexNowKeyFileName } from "@/lib/seo/indexnow";

type Params = { params: Promise<{ indexnowKeyFile: string }> };

/** Serves IndexNow verification key at /{key}.txt when INDEXNOW_KEY is configured. */
export async function GET(_request: Request, { params }: Params) {
  const { indexnowKeyFile } = await params;
  const expected = getIndexNowKeyFileName();
  const key = getIndexNowKey();
  if (!expected || !key || indexnowKeyFile !== expected) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(key, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
