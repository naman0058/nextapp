"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  createInitialWebsiteSession,
  websiteScanReducer,
  type WebsiteScanAction,
} from "@/features/website-scanner/state/websiteScanReducer";
import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";

type Ctx = {
  state: WebsiteScanSessionState;
  dispatch: React.Dispatch<WebsiteScanAction>;
  sampleMode: boolean;
};

const WebsiteScanContext = createContext<Ctx | null>(null);

const SAMPLE_BLOCKED_ACTIONS = new Set<WebsiteScanAction["type"]>([
  "START_SCAN",
  "SET_FIX_TASK_STATUS",
  "SET_MANUAL_REVIEW",
  "SET_SHOW_ALL_MANUAL_CHECKS",
  "SET_AI_GUIDANCE",
  "SET_AI_GUIDANCE_GROUP",
  "SET_AI_REMEDIATION_GROUP",
  "STOP_SCAN",
  "FINISH_SCAN",
]);

type WebsiteScanProviderProps = {
  children: ReactNode;
  initialState?: WebsiteScanSessionState;
  sampleMode?: boolean;
};

export function WebsiteScanProvider({
  children,
  initialState,
  sampleMode = false,
}: WebsiteScanProviderProps) {
  const [state, dispatch] = useReducer(
    websiteScanReducer,
    initialState ?? createInitialWebsiteSession(),
    (init) => init,
  );

  useEffect(() => {
    if (sampleMode) return;
    dispatch({ type: "INIT_CLIENT", sessionId: crypto.randomUUID() });
  }, [sampleMode]);

  const guardedDispatch: React.Dispatch<WebsiteScanAction> = useMemo(
    () => (action) => {
      if (sampleMode && SAMPLE_BLOCKED_ACTIONS.has(action.type)) {
        return;
      }
      dispatch(action);
    },
    [sampleMode],
  );

  const value = useMemo(
    () => ({ state, dispatch: guardedDispatch, sampleMode }),
    [state, guardedDispatch, sampleMode],
  );

  return (
    <WebsiteScanContext.Provider value={value}>
      {children}
    </WebsiteScanContext.Provider>
  );
}

export function useWebsiteScanSession(): Ctx {
  const ctx = useContext(WebsiteScanContext);
  if (!ctx) {
    throw new Error("useWebsiteScanSession requires WebsiteScanProvider");
  }
  return ctx;
}
