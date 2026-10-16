import type { FrameLocator, Locator, Page } from "playwright";
import type { VisualLocatorMatch } from "@/features/website-scanner/types/visualLocator";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";

export type ResolvedTarget = {
  locator: Locator;
  match: VisualLocatorMatch;
};

function buildLocatorFromAxeTarget(
  page: Page,
  target: unknown,
): Locator | null {
  if (typeof target === "string") {
    return page.locator(target);
  }
  if (!Array.isArray(target) || target.length === 0) return null;

  let frame: Page | FrameLocator = page;
  for (let i = 0; i < target.length; i += 1) {
    const part = target[i];
    const isLast = i === target.length - 1;
    if (typeof part === "string") {
      if (isLast) {
        return frame.locator(part);
      }
      if ("frameLocator" in frame) {
        frame = frame.frameLocator(part);
      } else {
        return null;
      }
    } else if (Array.isArray(part)) {
      if (part.length === 0) return null;
      const inner = buildLocatorFromAxeTarget(page, part);
      if (!inner) return null;
      return inner;
    } else {
      return null;
    }
  }
  return null;
}

export async function resolveAxeTargetOnPage(
  page: Page,
  target: unknown,
  selectorLabel: string,
): Promise<ResolvedTarget> {
  let locator = buildLocatorFromAxeTarget(page, target);
  if (!locator && selectorLabel) {
    locator = page.locator(selectorLabel);
  }
  if (!locator) {
    throw new WebsiteScanError(
      "UNSUPPORTED_TARGET",
      "Visual location is unavailable for this embedded element.",
    );
  }

  let count = 0;
  try {
    count = await locator.count();
  } catch {
    throw new WebsiteScanError(
      "UNSUPPORTED_TARGET",
      "Visual location is unavailable for this element.",
    );
  }

  if (count === 0) {
    throw new WebsiteScanError(
      "ELEMENT_NOT_FOUND",
      "This element could not be located in the latest page render. The page may have changed since the scan.",
    );
  }

  if (count > 1) {
    locator = locator.first();
  }

  const box = await locator.boundingBox();
  if (!box) {
    throw new WebsiteScanError(
      "ELEMENT_NOT_VISIBLE",
      "The affected element exists in the DOM but was not visually rendered in this page state.",
    );
  }
  if (box.width <= 0 || box.height <= 0) {
    throw new WebsiteScanError(
      "ELEMENT_NOT_VISIBLE",
      "No visible box is available for this element.",
    );
  }

  return { locator, match: count === 1 ? "exact" : "strong" };
}
