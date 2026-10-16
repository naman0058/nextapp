import { BATCH_PAGE_SIZE_DEFAULT } from "@/features/batch/constants/batchLimits";
import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import type {
  BatchBulkFixUndo,
  BatchDefaultPlatformMode,
  BatchFilterId,
  BatchMetadata,
  BatchSession,
  BatchSortState,
} from "@/features/batch/types/batchSession";
import { computeBatchSessionSummary } from "@/features/batch/utils/analysis/computeBatchSessionSummary";
import { markAiStaleIfNeeded } from "@/features/batch/utils/ai/batchAiStale";
import { analyzeBatchItemLocal } from "@/features/batch/utils/analysis/analyzeBatchItemLocal";
import type { SocialPlatform } from "@/types";

export function createInitialBatchSession(sessionId?: string): BatchSession {
  return {
    sessionId: sessionId ?? "batch-session-local",
    createdAt: "",
    metadata: {},
    defaultPlatformMode: "use_csv",
    items: [],
    filter: "all",
    platformFilter: "all",
    searchQuery: "",
    sort: { field: "id", direction: "asc" },
    page: 1,
    pageSize: BATCH_PAGE_SIZE_DEFAULT,
    selectedIds: new Set(),
    aiQueue: {
      running: false,
      cancelled: false,
      total: 0,
      completed: 0,
      succeeded: 0,
      failed: 0,
      sessionAiCount: 0,
    },
    remediationQueue: {
      running: false,
      cancelled: false,
      total: 0,
      completed: 0,
      succeeded: 0,
      failed: 0,
      sessionRemediationCount: 0,
    },
    localProcessing: false,
    importPhase: "idle",
  };
}

export type BatchState = BatchSession & {
  summary: ReturnType<typeof computeBatchSessionSummary>;
  bulkFixUndo: BatchBulkFixUndo | null;
  localProgress: { done: number; total: number } | null;
};

export function batchStateFromSession(session: BatchSession): BatchState {
  return {
    ...session,
    summary: computeBatchSessionSummary(session.items),
    bulkFixUndo: null,
    localProgress: null,
  };
}

export type BatchAction =
  | { type: "SET_METADATA"; metadata: Partial<BatchMetadata> }
  | { type: "SET_DEFAULT_PLATFORM"; mode: BatchDefaultPlatformMode }
  | { type: "IMPORT_ITEMS"; items: BatchAccessibilityItem[] }
  | { type: "SET_IMPORT_PHASE"; phase: BatchSession["importPhase"] }
  | { type: "SET_ITEMS"; items: BatchAccessibilityItem[] }
  | { type: "UPDATE_ITEM"; id: string; patch: Partial<BatchAccessibilityItem> }
  | { type: "REMOVE_ITEMS"; ids: string[] }
  | { type: "CLEAR_BATCH" }
  | { type: "SET_FILTER"; filter: BatchFilterId }
  | { type: "SET_PLATFORM_FILTER"; platform: SocialPlatform | "all" }
  | { type: "SET_SEARCH"; query: string }
  | { type: "SET_SORT"; sort: BatchSortState }
  | { type: "SET_PAGE"; page: number }
  | { type: "SET_PAGE_SIZE"; pageSize: number }
  | { type: "SET_SELECTION"; ids: string[] }
  | { type: "TOGGLE_SELECTION"; id: string }
  | { type: "SELECT_FILTERED"; ids: string[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_LOCAL_PROCESSING"; value: boolean }
  | { type: "SET_LOCAL_PROGRESS"; progress: { done: number; total: number } | null }
  | { type: "AI_QUEUE_START"; total: number }
  | { type: "AI_QUEUE_PROGRESS"; stats: { completed: number; succeeded: number; failed: number } }
  | { type: "AI_QUEUE_END"; sessionAiDelta: number }
  | { type: "AI_QUEUE_CANCEL" }
  | { type: "REMEDIATION_QUEUE_START"; total: number }
  | {
      type: "REMEDIATION_QUEUE_PROGRESS";
      stats: { completed: number; succeeded: number; failed: number };
    }
  | { type: "REMEDIATION_QUEUE_END"; sessionRemediationDelta: number }
  | { type: "REMEDIATION_QUEUE_CANCEL" }
  | { type: "SET_BULK_FIX_UNDO"; undo: BatchBulkFixUndo | null }
  | { type: "SET_SESSION_ID"; sessionId: string }
  | { type: "INIT_CLIENT_SESSION"; sessionId: string; createdAt: string };

function recompute(state: BatchState, items: BatchAccessibilityItem[]): BatchState {
  return {
    ...state,
    items,
    summary: computeBatchSessionSummary(items),
  };
}

export function batchReducer(state: BatchState, action: BatchAction): BatchState {
  switch (action.type) {
    case "SET_METADATA":
      return { ...state, metadata: { ...state.metadata, ...action.metadata } };
    case "SET_DEFAULT_PLATFORM":
      return { ...state, defaultPlatformMode: action.mode };
    case "IMPORT_ITEMS":
      return recompute(
        { ...state, importPhase: "preview", selectedIds: new Set() },
        action.items,
      );
    case "SET_IMPORT_PHASE":
      return { ...state, importPhase: action.phase };
    case "SET_ITEMS":
      return recompute(state, action.items);
    case "UPDATE_ITEM": {
      const items = state.items.map((item) => {
        if (item.id !== action.id) return item;
        let next = { ...item, ...action.patch };
        next = markAiStaleIfNeeded(next);
        if (next.localAnalysis && next.validation.canAnalyze) {
          next = analyzeBatchItemLocal(next);
        }
        return next;
      });
      return recompute(state, items);
    }
    case "REMOVE_ITEMS": {
      const remove = new Set(action.ids);
      const items = state.items.filter((i) => !remove.has(i.id));
      const selectedIds = new Set(
        [...state.selectedIds].filter((id) => !remove.has(id)),
      );
      return recompute({ ...state, selectedIds }, items);
    }
    case "CLEAR_BATCH":
      return {
        ...createInitialBatchSession(),
        sessionId: state.sessionId,
        bulkFixUndo: null,
        localProgress: null,
        summary: computeBatchSessionSummary([]),
      };
    case "SET_FILTER":
      return { ...state, filter: action.filter, page: 1 };
    case "SET_PLATFORM_FILTER":
      return { ...state, platformFilter: action.platform, page: 1 };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.query, page: 1 };
    case "SET_SORT":
      return { ...state, sort: action.sort };
    case "SET_PAGE":
      return { ...state, page: action.page };
    case "SET_PAGE_SIZE":
      return { ...state, pageSize: action.pageSize, page: 1 };
    case "SET_SELECTION":
      return { ...state, selectedIds: new Set(action.ids) };
    case "TOGGLE_SELECTION": {
      const next = new Set(state.selectedIds);
      if (next.has(action.id)) next.delete(action.id);
      else next.add(action.id);
      return { ...state, selectedIds: next };
    }
    case "SELECT_FILTERED":
      return { ...state, selectedIds: new Set(action.ids) };
    case "CLEAR_SELECTION":
      return { ...state, selectedIds: new Set() };
    case "SET_LOCAL_PROCESSING":
      return { ...state, localProcessing: action.value };
    case "SET_LOCAL_PROGRESS":
      return { ...state, localProgress: action.progress };
    case "AI_QUEUE_START":
      return {
        ...state,
        aiQueue: {
          ...state.aiQueue,
          running: true,
          cancelled: false,
          total: action.total,
          completed: 0,
          succeeded: 0,
          failed: 0,
        },
      };
    case "AI_QUEUE_PROGRESS":
      return {
        ...state,
        aiQueue: {
          ...state.aiQueue,
          completed: action.stats.completed,
          succeeded: action.stats.succeeded,
          failed: action.stats.failed,
        },
      };
    case "AI_QUEUE_END":
      return {
        ...state,
        aiQueue: {
          ...state.aiQueue,
          running: false,
          sessionAiCount:
            state.aiQueue.sessionAiCount + action.sessionAiDelta,
        },
      };
    case "AI_QUEUE_CANCEL":
      return {
        ...state,
        aiQueue: { ...state.aiQueue, cancelled: true },
      };
    case "REMEDIATION_QUEUE_START":
      return {
        ...state,
        remediationQueue: {
          ...state.remediationQueue,
          running: true,
          cancelled: false,
          total: action.total,
          completed: 0,
          succeeded: 0,
          failed: 0,
        },
      };
    case "REMEDIATION_QUEUE_PROGRESS":
      return {
        ...state,
        remediationQueue: {
          ...state.remediationQueue,
          completed: action.stats.completed,
          succeeded: action.stats.succeeded,
          failed: action.stats.failed,
        },
      };
    case "REMEDIATION_QUEUE_END":
      return {
        ...state,
        remediationQueue: {
          ...state.remediationQueue,
          running: false,
          sessionRemediationCount:
            state.remediationQueue.sessionRemediationCount +
            action.sessionRemediationDelta,
        },
      };
    case "REMEDIATION_QUEUE_CANCEL":
      return {
        ...state,
        remediationQueue: { ...state.remediationQueue, cancelled: true },
      };
    case "SET_BULK_FIX_UNDO":
      return { ...state, bulkFixUndo: action.undo };
    case "SET_SESSION_ID":
      return { ...state, sessionId: action.sessionId };
    case "INIT_CLIENT_SESSION":
      return {
        ...state,
        sessionId: action.sessionId,
        createdAt: action.createdAt,
      };
    default:
      return state;
  }
}
