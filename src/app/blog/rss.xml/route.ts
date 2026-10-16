import { markBlogDynamic } from "@/lib/blog/request/markBlogDynamic";
import { getPublishedForRss } from "@/lib/blog/repository/getPublishedForRss";
import { buildBlogRssXml } from "@/lib/blog/rss/buildRssXml";

export async function GET() {
  await markBlogDynamic();
  const result = await getPublishedForRss();
  if (!result.ok) {
    return new Response(buildBlogRssXml([]), {
      status: 200,
      headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
    });
  }

  const xml = buildBlogRssXml(result.data);
  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
