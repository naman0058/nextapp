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
  batchReducer,
  batchStateFromSession,
  createInitialBatchSession,
  type BatchAction,
  type BatchState,
} from "@/features/batch/state/batchReducer";

const BatchContext = createContext<{
  state: BatchState;
  dispatch: React.Dispatch<BatchAction>;
} | null>(null);

export function BatchSessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    batchReducer,
    undefined,
    () => batchStateFromSession(createInitialBatchSession()),
  );

  useEffect(() => {
    if (state.sessionId !== "batch-session-local") return;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `batch-${Date.now().toString(36)}`;
    dispatch({
      type: "INIT_CLIENT_SESSION",
      sessionId: id,
      createdAt: new Date().toISOString(),
    });
  }, [state.sessionId]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return (
    <BatchContext.Provider value={value}>{children}</BatchContext.Provider>
  );
}

export function useBatchSession() {
  const ctx = useContext(BatchContext);
  if (!ctx) {
    throw new Error("useBatchSession must be used within BatchSessionProvider");
  }
  return ctx;
}
