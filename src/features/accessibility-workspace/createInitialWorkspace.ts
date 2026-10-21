import type { AccessibilityWorkspaceState } from "@/features/accessibility-workspace/types";

/** Stable placeholder until client INIT_CLIENT assigns real session timestamps (SSR/prerender safe). */
export const WORKSPACE_SSR_PLACEHOLDER_TIME = "1970-01-01T00:00:00.000Z";
export const WORKSPACE_SSR_PLACEHOLDER_ID = "pending-workspace";

export function createInitialAccessibilityWorkspace(
  workspaceId?: string,
  options?: { fixedNow?: string; fixedWorkspaceId?: string },
): AccessibilityWorkspaceState {
  const now = options?.fixedNow ?? WORKSPACE_SSR_PLACEHOLDER_TIME;
  return {
    workspaceId:
      workspaceId ??
      options?.fixedWorkspaceId ??
      WORKSPACE_SSR_PLACEHOLDER_ID,
    createdAt: now,
    updatedAt: now,
    contributions: [],
    returnToFinding: null,
    humanReviewRecords: [],
  };
}
