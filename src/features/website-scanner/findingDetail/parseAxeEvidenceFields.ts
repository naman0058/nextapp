import type { ElementContextSummary } from "@/features/website-scanner/types/scanTypes";
import type {
  AriaSemanticsEvidenceFields,
  ContrastEvidenceFields,
} from "@/features/website-scanner/findingDetail/types";

const CONTRAST_RATIO_RE =
  /contrast ratio of ([\d.]+(?::\d+)?(?::\d+)?|\d+(?:\.\d+)?(?::\d+)?), but got ([\d.]+(?::\d+)?)/i;
const REQUIRED_RATIO_RE = /expected contrast ratio of ([\d.]+(?::\d+)?)/i;
const FG_BG_RE =
  /foreground color: (#\w+|[^,]+), background color: (#\w+|[^,]+)/i;
const FONT_SIZE_RE = /font size: ([^;]+)/i;
const FONT_WEIGHT_RE = /font weight: ([^;]+)/i;

export function parseContrastFromFailureSummary(
  failureSummary: string | undefined,
  ruleId: string,
): ContrastEvidenceFields | undefined {
  if (!failureSummary) return undefined;
  if (!/contrast/i.test(ruleId) && !/contrast/i.test(failureSummary)) {
    return undefined;
  }
  const out: ContrastEvidenceFields = { rawFailureSummary: failureSummary };
  const ratioMatch = CONTRAST_RATIO_RE.exec(failureSummary);
  if (ratioMatch) {
    out.requiredRatio = ratioMatch[1];
    out.measuredContrastRatio = ratioMatch[2];
  } else {
    const req = REQUIRED_RATIO_RE.exec(failureSummary);
    if (req) out.requiredRatio = req[1];
  }
  const colors = FG_BG_RE.exec(failureSummary);
  if (colors) {
    out.foregroundColor = colors[1]?.trim();
    out.backgroundColor = colors[2]?.trim();
  }
  const fs = FONT_SIZE_RE.exec(failureSummary);
  if (fs) out.fontSize = fs[1]?.trim();
  const fw = FONT_WEIGHT_RE.exec(failureSummary);
  if (fw) out.fontWeight = fw[1]?.trim();
  const hasStructured =
    out.measuredContrastRatio ||
    out.requiredRatio ||
    out.foregroundColor ||
    out.backgroundColor;
  return hasStructured ? out : { rawFailureSummary: failureSummary };
}

export function ariaFieldsFromContext(
  elementContext: ElementContextSummary | undefined,
  htmlSnippet: string | undefined,
  failureSummary: string | undefined,
): AriaSemanticsEvidenceFields | undefined {
  if (!elementContext && !failureSummary) return undefined;
  const ariaAttributes: string[] = [];
  if (htmlSnippet) {
    const re = /\b(aria-[a-z-]+)\s*=/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(htmlSnippet)) !== null) {
      if (!ariaAttributes.includes(m[1]!)) ariaAttributes.push(m[1]!);
    }
  }
  const out: AriaSemanticsEvidenceFields = {
    tag: elementContext?.tag,
    role: elementContext?.role,
    ariaAttributes: ariaAttributes.length ? ariaAttributes : undefined,
    accessibleNameHint: elementContext?.hasAriaLabel
      ? "aria-label present on element"
      : undefined,
    failureSummary,
  };
  if (
    !out.tag &&
    !out.role &&
    !out.ariaAttributes?.length &&
    !out.failureSummary
  ) {
    return undefined;
  }
  return out;
}
