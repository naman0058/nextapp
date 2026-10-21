"use client";

import { useEffect } from "react";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import {
  clearToolHandoff,
  readPendingContributions,
  clearPendingContributions,
  readPersistedWorkspaceContributions,
  persistWorkspaceContributions,
  readToolHandoff,
} from "@/features/accessibility-workspace/handoffStorage";

/** Merges cross-route contributions and applies return-to-finding after specialized tools. */
export function WorkspaceReturnCoordinator() {
  const { state, dispatch, sampleMode } = useWebsiteScanSession();

  useEffect(() => {
    if (sampleMode || !state.sessionId) return;

    const pending = readPendingContributions();
    if (pending.length > 0) {
      dispatch({ type: "MERGE_PENDING_CONTRIBUTIONS", contributions: pending });
      clearPendingContributions();
    } else if (state.accessibilityWorkspace.contributions.length === 0) {
      const persisted = readPersistedWorkspaceContributions();
      if (persisted.length > 0) {
        dispatch({ type: "MERGE_PENDING_CONTRIBUTIONS", contributions: persisted });
      }
    }

    const handoff = readToolHandoff();
    if (
      handoff?.returnTo?.websiteSessionId &&
      handoff.returnTo.websiteSessionId === state.sessionId
    ) {
      dispatch({ type: "APPLY_RETURN_TO_FINDING", returnTo: handoff.returnTo });
      clearToolHandoff();
    }
  }, [sampleMode, state.sessionId, dispatch, state.accessibilityWorkspace.contributions.length]);

  useEffect(() => {
    if (sampleMode) return;
    persistWorkspaceContributions(state.accessibilityWorkspace.contributions);
  }, [sampleMode, state.accessibilityWorkspace.contributions]);

  return null;
}
