import type { Locator } from "playwright";
import { VISUAL_LOCATOR_BOX_PADDING_PX } from "@/features/website-scanner/constants/visualLocatorLimits";

export async function injectVisualOverlay(
  locator: Locator,
  options: { occurrenceIndex: number; label: string },
): Promise<void> {
  const padding = VISUAL_LOCATOR_BOX_PADDING_PX;
  const badge = String(options.occurrenceIndex + 1);
  const label = options.label.slice(0, 80);

  await locator.evaluate(
    (el, opts) => {
      const existing = document.querySelector("[data-accessible-preflight-overlay]");
      existing?.remove();

      const rect = el.getBoundingClientRect();
      const host = document.createElement("div");
      host.setAttribute("data-accessible-preflight-overlay", "true");
      host.style.cssText =
        "position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:2147483646;";

      const box = document.createElement("div");
      const pad = opts.padding;
      box.style.cssText = [
        "position:fixed",
        `left:${rect.left - pad}px`,
        `top:${rect.top - pad}px`,
        `width:${rect.width + pad * 2}px`,
        `height:${rect.height + pad * 2}px`,
        "box-sizing:border-box",
        "border:3px solid #2563eb",
        "background:rgba(37,99,235,0.12)",
        "outline:2px dashed #0f172a",
        "pointer-events:none",
      ].join(";");

      const badgeEl = document.createElement("span");
      badgeEl.textContent = opts.badge;
      badgeEl.style.cssText = [
        "position:absolute",
        "left:-2px",
        "top:-2px",
        "min-width:1.5rem",
        "height:1.5rem",
        "padding:0 4px",
        "background:#2563eb",
        "color:#fff",
        "font:bold 12px/1.5rem system-ui,sans-serif",
        "text-align:center",
        "border-radius:4px",
        "border:2px solid #0f172a",
      ].join(";");

      const caption = document.createElement("span");
      caption.textContent = opts.label;
      caption.style.cssText = [
        "position:absolute",
        "left:0",
        "bottom:100%",
        "margin-bottom:4px",
        "max-width:min(280px,90vw)",
        "padding:2px 6px",
        "background:#0f172a",
        "color:#fff",
        "font:11px system-ui,sans-serif",
        "border-radius:4px",
        "white-space:nowrap",
        "overflow:hidden",
        "text-overflow:ellipsis",
      ].join(";");

      box.appendChild(badgeEl);
      box.appendChild(caption);
      host.appendChild(box);
      document.body.appendChild(host);
    },
    { padding, badge, label },
  );

  await locator.scrollIntoViewIfNeeded();
  await locator.page().waitForTimeout(150);
}
