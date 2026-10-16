import {
  MAX_AXE_TARGET_DEPTH,
  MAX_AXE_TARGET_PARTS,
  MAX_VISUAL_LOCATOR_SELECTOR_CHARS,
} from "@/features/website-scanner/constants/visualLocatorLimits";

export function validateAxeTargetBounds(
  target: unknown,
  selectorLabel: string,
): { ok: true } | { ok: false; error: string } {
  if (selectorLabel.length > MAX_VISUAL_LOCATOR_SELECTOR_CHARS) {
    return { ok: false, error: "Selector evidence is too long." };
  }
  let parts = 0;
  function walk(node: unknown, depth: number): boolean {
    if (depth > MAX_AXE_TARGET_DEPTH) return false;
    if (typeof node === "string") {
      parts += 1;
      return parts <= MAX_AXE_TARGET_PARTS;
    }
    if (Array.isArray(node)) {
      for (const child of node) {
        if (!walk(child, depth + 1)) return false;
      }
      return true;
    }
    return false;
  }
  if (!walk(target, 0)) {
    return { ok: false, error: "Invalid or oversized element target." };
  }
  if (parts === 0) {
    return { ok: false, error: "Element target is required." };
  }
  return { ok: true };
}
