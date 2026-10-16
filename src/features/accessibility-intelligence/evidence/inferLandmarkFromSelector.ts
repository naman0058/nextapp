import type { LandmarkContext } from "@/features/website-scanner/types/scanTypes";

export function inferLandmarkFromSelector(selector: string): LandmarkContext {
  const s = selector.toLowerCase();
  if (s.includes("nav") || s.includes("navigation") || s.includes('[role="navigation"]')) {
    return "navigation";
  }
  if (s.includes("footer") || s.includes('[role="contentinfo"]')) {
    return "footer";
  }
  if (s.includes("header") || s.includes('[role="banner"]')) {
    return "header";
  }
  if (s.includes("main") || s.includes('[role="main"]')) {
    return "main";
  }
  if (s.includes("dialog") || s.includes('[role="dialog"]')) {
    return "dialog";
  }
  if (s.includes("form")) return "form";
  if (s.includes("aside") || s.includes('[role="complementary"]')) {
    return "aside";
  }
  return "unknown";
}
