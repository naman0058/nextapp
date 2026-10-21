"use client";

import { useRouter } from "next/navigation";
import type { FindingDetail } from "@/features/website-scanner/findingDetail/types";
import { buildToolHandoff } from "@/features/accessibility-workspace/buildHandoffFromFinding";
import { resolveToolIdForHandoff } from "@/features/accessibility-workspace/resolveToolIdForHandoff";
import { toolCapabilities } from "@/features/accessibility-workspace/toolCatalog";
import { writeToolHandoff } from "@/features/accessibility-workspace/handoffStorage";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";

type Props = {
  detail: FindingDetail;
  href: string;
  label: string;
  className?: string;
};

export function OpenSpecializedToolButton({ detail, href, label, className }: Props) {
  const router = useRouter();
  const { state, sampleMode } = useWebsiteScanSession();

  if (sampleMode) return null;

  const toolId = resolveToolIdForHandoff(detail, href);
  if (!toolId || !toolCapabilities(toolId).supportsContextualHandoff) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (!state.sessionId) return;
        const handoff = buildToolHandoff({
          toolId,
          detail,
          websiteSessionId: state.sessionId,
        });
        writeToolHandoff(handoff);
        router.push(href);
      }}
    >
      {label}
    </button>
  );
}
