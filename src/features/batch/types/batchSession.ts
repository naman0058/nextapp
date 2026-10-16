import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import type { SocialPlatform } from "@/types";

export type BatchDefaultPlatformMode =
  | "use_csv"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "x";

export type BatchMetadata = {
  batchName?: string;
  client?: string;
  campaign?: string;
  preparedBy?: string;
  notes?: string;
};

export type BatchFilterId =
  | "all"
  | "ready"
  | "review"
  | "attention"
  | "failed"
  | "has_image"
  | "missing_alt"
  | "ai_not_run"
  | "ai_completed"
  | "image_missing";

export type BatchSortField =
  | "id"
  | "platform"
  | "score"
  | "status"
  | "issue_count"
  | "human_review";

export type BatchSortState = {
  field: BatchSortField;
  direction: "asc" | "desc";
};

export type BatchAiQueueState = {
  running: boolean;
  cancelled: boolean;
  total: number;
  completed: number;
  succeeded: number;
  failed: number;
  sessionAiCount: number;
};

export type BatchRemediationQueueState = {
  running: boolean;
  cancelled: boolean;
  total: number;
  completed: number;
  succeeded: number;
  failed: number;
  sessionRemediationCount: number;
};

export type BatchSessionSummary = {
  totalItems: number;
  ready: number;
  needsReview: number;
  attention: number;
  failed: number;
  aiCompleted: number;
  aiNotRun: number;
  imagesMissing: number;
  missingAltText: number;
  averageLocalScore: number | null;
  batchOverallLabel:
    | "Ready for Final Review"
    | "Review In Progress"
    | "Important Items Remaining"
    | "Incomplete Analysis";
  platformCounts: Record<string, number>;
  topIssueCategories: { category: string; count: number }[];
};

export type BatchSession = {
  sessionId: string;
  createdAt: string;
  metadata: BatchMetadata;
  defaultPlatformMode: BatchDefaultPlatformMode;
  items: BatchAccessibilityItem[];
  filter: BatchFilterId;
  platformFilter: SocialPlatform | "all";
  searchQuery: string;
  sort: BatchSortState;
  page: number;
  pageSize: number;
  selectedIds: Set<string>;
  aiQueue: BatchAiQueueState;
  remediationQueue: BatchRemediationQueueState;
  localProcessing: boolean;
  importPhase: "idle" | "preview" | "processed";
};

export type BatchBulkFixUndo = {
  itemIds: string[];
  snapshots: { id: string; caption: string }[];
};
