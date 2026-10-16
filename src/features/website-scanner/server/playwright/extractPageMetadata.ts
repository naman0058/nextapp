import type { Page } from "playwright";
import type { WebsitePageMetadata } from "@/features/website-scanner/types/scanTypes";
import { MAX_DOM_NODES } from "@/features/website-scanner/constants/scanLimits";

export async function extractPageMetadata(
  page: Page,
  pageOrigin: string,
): Promise<{ metadata: WebsitePageMetadata; domTooLarge: boolean }> {
  const data = await page.evaluate((origin) => {
    const doc = document;
    const domNodeCount = doc.getElementsByTagName("*").length;
    const anchors = Array.from(doc.querySelectorAll("a[href]"));
    let internalLinkCount = 0;
    for (const a of anchors) {
      try {
        const u = new URL(a.getAttribute("href") ?? "", doc.baseURI);
        if (u.origin === origin) internalLinkCount += 1;
      } catch {
        /* skip */
      }
    }
    const interactiveControlCount =
      doc.querySelectorAll(
        'a[href], button, input, select, textarea, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])',
      ).length;
    return {
      documentLang: doc.documentElement.lang || null,
      domNodeCount,
      internalLinkCount,
      linkCount: anchors.length,
      iframeCount: doc.querySelectorAll("iframe").length,
      formCount: doc.querySelectorAll("form").length,
      imageCount: doc.querySelectorAll("img").length,
      headingCount: doc.querySelectorAll("h1,h2,h3,h4,h5,h6").length,
      videoCount: doc.querySelectorAll("video").length,
      interactiveControlCount,
      dialogHintCount: doc.querySelectorAll(
        '[role="dialog"], dialog, [aria-modal="true"]',
      ).length,
    };
  }, pageOrigin);

  return {
    metadata: data,
    domTooLarge: data.domNodeCount > MAX_DOM_NODES,
  };
}
