"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppPanel } from "@/components/app/AppPanel";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { MAX_CSV_FILE_SIZE_BYTES } from "@/features/batch/constants/batchLimits";
import { BATCH_PAGE_SIZE_OPTIONS } from "@/features/batch/constants/batchLimits";
import { useBatchSession } from "@/features/batch/context/BatchSessionProvider";
import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import type { BatchDefaultPlatformMode } from "@/features/batch/types/batchSession";
import { runLocalBatchPreflight } from "@/features/batch/utils/analysis/runLocalBatchPreflight";
import {
  planBatchAiRun,
  runBatchAiQueue,
} from "@/features/batch/utils/ai/runBatchAiQueue";
import { planBatchRemediationRun } from "@/features/batch/utils/ai/planBatchRemediationRun";
import { runBatchRemediationQueue } from "@/features/batch/utils/ai/runBatchRemediationQueue";
import type { BatchRemediationTarget } from "@/lib/ai/remediation/adapters/buildBatchRemediationContext";
import { parseBatchCsv } from "@/features/batch/utils/csv/parseBatchCsv";
import { downloadBatchCsvTemplate } from "@/features/batch/utils/csv/downloadBatchCsvTemplate";
import { downloadImportErrorsCsv } from "@/features/batch/utils/csv/downloadImportErrorsCsv";
import { buildItemsFromCsvRows } from "@/features/batch/utils/items/buildItemsFromCsvRows";
import {
  attachZipImagesToItems,
  computeImageImportCounts,
} from "@/features/batch/utils/images/matchImagesToRows";
import { revokeAllBatchImageUrls } from "@/features/batch/utils/images/revokeBatchImageUrls";
import { extractBatchZipImages } from "@/features/batch/utils/zip/extractBatchZipImages";
import {
  filterBatchItems,
  paginateBatchItems,
  sortBatchItems,
} from "@/features/batch/utils/table/filterAndSortBatchItems";
import {
  downloadBatchResultsCsv,
  type BatchExportPrivacy,
} from "@/features/batch/utils/export/exportBatchResultsCsv";
import { downloadPublishingCsv } from "@/features/batch/utils/export/exportPublishingCsv";
import { downloadReviewQueueCsv } from "@/features/batch/utils/export/exportReviewQueueCsv";
import { downloadBatchJson } from "@/features/batch/utils/export/exportBatchJson";
import {
  applyBulkFix,
  previewBulkFix,
  undoBulkFix,
  type BulkFixId,
} from "@/features/batch/utils/fixes/applyBulkFixToItems";
import {
  checkerHandoffPath,
  createBatchCheckerHandoff,
} from "@/features/batch/utils/handoff/batchToCheckerHandoff";
import { batchItemToReportSource } from "@/features/batch/utils/reports/batchItemToReportSource";
import { PreflightReportGenerator } from "@/features/reports/components/PreflightReportGenerator";
import { SOCIAL_PLATFORM_LABELS } from "@/constants";

const BATCH_PLATFORMS: SocialPlatform[] = [
  "instagram",
  "facebook",
  "linkedin",
  "x",
];
import type { SocialPlatform } from "@/types";
import { computeBatchSessionSummary } from "@/features/batch/utils/analysis/computeBatchSessionSummary";

const DEFAULT_PRIVACY: BatchExportPrivacy = {
  includeCaptions: true,
  includeAltText: true,
  includeAiSuggestions: true,
  includeClientMetadata: true,
  includeInternalNotes: false,
};

export function BatchAccessibilityCheckerPage() {
  const { state, dispatch } = useBatchSession();
  const router = useRouter();
  const aiCancelRef = useRef(false);
  const remediationCancelRef = useRef(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [exportPrivacy, setExportPrivacy] = useState(DEFAULT_PRIVACY);
  const [bulkFixId, setBulkFixId] = useState<BulkFixId>("fancy-unicode-normalize");
  const [showAiConfirm, setShowAiConfirm] = useState(false);
  const [showRemediationConfirm, setShowRemediationConfirm] = useState(false);
  const [remediationTarget, setRemediationTarget] =
    useState<BatchRemediationTarget>("caption");

  const filtered = useMemo(() => {
    const f = filterBatchItems(
      state.items,
      state.filter,
      state.platformFilter,
      state.searchQuery,
    );
    return sortBatchItems(f, state.sort);
  }, [state.items, state.filter, state.platformFilter, state.searchQuery, state.sort]);

  const { pageItems, totalPages } = paginateBatchItems(
    filtered,
    state.page,
    state.pageSize,
  );

  const detailItem = state.items.find((i) => i.id === detailId) ?? null;

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (state.items.length > 0) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [state.items.length]);

  useEffect(() => {
    return () => revokeAllBatchImageUrls(state.items);
  }, [state.items]);

  const handleCsvFile = useCallback(
    async (file: File) => {
      setImportError(null);
      if (file.size > MAX_CSV_FILE_SIZE_BYTES) {
        setImportError("CSV file exceeds size limit.");
        return;
      }
      if (
        state.items.length > 0 &&
        !window.confirm(
          "Replace current batch? This removes all imported content and analysis from this session.",
        )
      ) {
        return;
      }
      const text = await file.text();
      const parsed = parseBatchCsv(text);
      if (!parsed.ok) {
        setImportError(parsed.error);
        return;
      }
      const { items, errors } = buildItemsFromCsvRows({
        rows: parsed.rows,
        defaultPlatformMode: state.defaultPlatformMode,
        batchMetadata: state.metadata,
      });
      if (errors.length) {
        downloadImportErrorsCsv(errors);
        setImportError(
          `${errors.length} import error(s). Downloaded import-errors CSV.`,
        );
      }
      dispatch({ type: "IMPORT_ITEMS", items });
    },
    [dispatch, state.defaultPlatformMode, state.items.length, state.metadata],
  );

  const handleZipFile = useCallback(
    async (file: File) => {
      setImportError(null);
      const extracted = await extractBatchZipImages(file);
      if (!extracted.ok) {
        setImportError(extracted.error);
        return;
      }
      const withImages = await attachZipImagesToItems(
        state.items,
        extracted.images,
      );
      dispatch({ type: "SET_ITEMS", items: withImages });
    },
    [dispatch, state.items],
  );

  const runLocal = useCallback(async () => {
    dispatch({ type: "SET_LOCAL_PROCESSING", value: true });
    const updated = await runLocalBatchPreflight(state.items, (done, total) => {
      dispatch({ type: "SET_LOCAL_PROGRESS", progress: { done, total } });
    });
    dispatch({ type: "SET_ITEMS", items: updated });
    dispatch({ type: "SET_IMPORT_PHASE", phase: "processed" });
    dispatch({ type: "SET_LOCAL_PROCESSING", value: false });
    dispatch({ type: "SET_LOCAL_PROGRESS", progress: null });
  }, [dispatch, state.items]);

  const runAi = useCallback(async () => {
    const plan = planBatchAiRun(
      state.items,
      [...state.selectedIds],
      state.aiQueue.sessionAiCount,
    );
    if (plan.error && plan.cappedCount === 0) {
      setImportError(plan.error);
      return;
    }
    const ids =
      plan.cappedCount > 0
        ? plan.eligibleIds
        : state.items
            .filter((i) => state.selectedIds.has(i.id))
            .filter((i) => i.image?.file?.size && i.platform)
            .slice(0, 20)
            .map((i) => i.id);

    aiCancelRef.current = false;
    dispatch({ type: "AI_QUEUE_START", total: ids.length });
    let currentItems = state.items;

    await runBatchAiQueue(state.items, ids, {
      isCancelled: () => aiCancelRef.current,
      onProgress: (stats) => {
        dispatch({ type: "AI_QUEUE_PROGRESS", stats });
      },
      onItemUpdate: (item) => {
        currentItems = currentItems.map((i) =>
          i.id === item.id ? item : i,
        );
        dispatch({ type: "SET_ITEMS", items: currentItems });
      },
    }).then(({ sessionAiDelta }) => {
      dispatch({ type: "AI_QUEUE_END", sessionAiDelta });
    });
    setShowAiConfirm(false);
  }, [dispatch, state.aiQueue.sessionAiCount, state.items, state.selectedIds]);

  const runRemediation = useCallback(async () => {
    const plan = planBatchRemediationRun(
      state.items,
      [...state.selectedIds],
      state.remediationQueue.sessionRemediationCount,
      remediationTarget,
    );
    if (plan.error && plan.cappedCount === 0) {
      setImportError(plan.error);
      return;
    }
    const ids = plan.eligibleIds;
    remediationCancelRef.current = false;
    dispatch({ type: "REMEDIATION_QUEUE_START", total: ids.length });
    let currentItems = state.items;

    await runBatchRemediationQueue(
      state.items,
      ids,
      state.sessionId,
      remediationTarget,
      {
        isCancelled: () => remediationCancelRef.current,
        onProgress: (stats) => {
          dispatch({ type: "REMEDIATION_QUEUE_PROGRESS", stats });
        },
        onItemUpdate: (item) => {
          currentItems = currentItems.map((i) => (i.id === item.id ? item : i));
          dispatch({ type: "SET_ITEMS", items: currentItems });
        },
      },
    ).then(({ sessionRemediationDelta }) => {
      dispatch({ type: "REMEDIATION_QUEUE_END", sessionRemediationDelta });
    });
    setShowRemediationConfirm(false);
  }, [
    dispatch,
    remediationTarget,
    state.items,
    state.remediationQueue.sessionRemediationCount,
    state.selectedIds,
    state.sessionId,
  ]);

  const remediationPlanPreview = useMemo(() => {
    if (!showRemediationConfirm) return null;
    return planBatchRemediationRun(
      state.items,
      [...state.selectedIds],
      state.remediationQueue.sessionRemediationCount,
      remediationTarget,
    );
  }, [
    showRemediationConfirm,
    state.items,
    state.selectedIds,
    state.remediationQueue.sessionRemediationCount,
    remediationTarget,
  ]);

  const importCounts = useMemo(
    () => computeImageImportCounts(state.items),
    [state.items],
  );

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted">
        Batch data is stored only in this browser session. Download results
        before refreshing or closing the page.
      </p>

      <AppPanel title="Batch import" id="batch-import">
        <p className="mb-4 text-sm text-muted">
          CSV and ZIP files are parsed locally in your browser. Images are sent
          to OpenAI only when you explicitly run AI image review for selected
          items.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={downloadBatchCsvTemplate}>
            Download CSV template
          </Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            Default platform (when CSV platform blank)
            <select
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              value={state.defaultPlatformMode}
              onChange={(e) =>
                dispatch({
                  type: "SET_DEFAULT_PLATFORM",
                  mode: e.target.value as BatchDefaultPlatformMode,
                })
              }
            >
              <option value="use_csv">Use CSV platform column</option>
              {BATCH_PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {SOCIAL_PLATFORM_LABELS[p]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold">
            Step 2 — Upload CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="mt-2 block w-full text-sm"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleCsvFile(f);
                e.target.value = "";
              }}
            />
          </label>
          <label className="block text-sm font-semibold">
            Step 3 — Optional image ZIP
            <input
              type="file"
              accept=".zip,application/zip"
              className="mt-2 block w-full text-sm"
              disabled={state.items.length === 0}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleZipFile(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {importError ? (
          <StatusMessage variant="error" title="Import" className="mt-4">
            {importError}
          </StatusMessage>
        ) : null}
        {state.items.length > 0 && state.importPhase === "preview" ? (
          <div className="mt-4 rounded-lg border border-border bg-muted-bg p-3 text-sm">
            <p className="font-semibold">Import preview</p>
            <p>
              Rows: {state.items.length} · Valid:{" "}
              {state.items.filter((i) => i.validation.severity !== "invalid").length}{" "}
              · Images matched: {importCounts.imagesMatched} · Missing:{" "}
              {importCounts.imagesMissing} · Ambiguous:{" "}
              {importCounts.imagesAmbiguous}
            </p>
          </div>
        ) : null}
      </AppPanel>

      {state.items.length > 0 ? (
        <>
          <AppPanel title="Batch metadata">
            <div className="grid gap-3 md:grid-cols-2">
              {(
                [
                  ["batchName", "Batch name"],
                  ["client", "Client"],
                  ["campaign", "Campaign"],
                  ["preparedBy", "Prepared by"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="text-sm">
                  {label}
                  <input
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                    value={state.metadata[key] ?? ""}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_METADATA",
                        metadata: { [key]: e.target.value },
                      })
                    }
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={state.localProcessing}
                onClick={() => void runLocal()}
              >
                Run local batch preflight
              </Button>
              {state.localProgress ? (
                <p className="text-sm text-muted" aria-live="polite">
                  Local checks {state.localProgress.done} /{" "}
                  {state.localProgress.total}
                </p>
              ) : null}
            </div>
          </AppPanel>

          {state.importPhase === "processed" ? (
            <>
              <BatchSummaryBar summary={state.summary} />
              <BatchFilters
                state={state}
                dispatch={dispatch}
                filteredCount={filtered.length}
              />
              {state.selectedIds.size > 0 ? (
                <BatchBulkBar
                  selectedCount={state.selectedIds.size}
                  onClear={() => dispatch({ type: "CLEAR_SELECTION" })}
                  onAi={() => setShowAiConfirm(true)}
                  onRemediation={() => setShowRemediationConfirm(true)}
                  onRemove={() => {
                    if (
                      window.confirm(
                        `Remove ${state.selectedIds.size} selected row(s)?`,
                      )
                    ) {
                      dispatch({
                        type: "REMOVE_ITEMS",
                        ids: [...state.selectedIds],
                      });
                      dispatch({ type: "CLEAR_SELECTION" });
                    }
                  }}
                />
              ) : null}
              {showAiConfirm ? (
                <StatusMessage variant="review" title="Confirm AI image review">
                  AI image review will analyze selected images and can use paid
                  OpenAI API requests. Items selected: {state.selectedIds.size}.
                  <div className="mt-2 flex gap-2">
                    <Button type="button" onClick={() => void runAi()}>
                      Start AI review
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowAiConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </StatusMessage>
              ) : null}
              {showRemediationConfirm ? (
                <StatusMessage variant="review" title="Confirm AI remediation">
                  Optional AI remediation runs on selected rows only (bounded). Items
                  selected: {state.selectedIds.size}. Eligible this run:{" "}
                  {remediationPlanPreview?.cappedCount ?? 0}.
                  <label className="mt-2 block text-sm">
                    Target
                    <select
                      className="ml-2 rounded border border-border px-2 py-1"
                      value={remediationTarget}
                      onChange={(e) =>
                        setRemediationTarget(e.target.value as BatchRemediationTarget)
                      }
                    >
                      <option value="caption">Caption revision</option>
                      <option value="alt">Alt text options</option>
                    </select>
                  </label>
                  {remediationPlanPreview?.error ? (
                    <p className="mt-1 text-xs text-muted">{remediationPlanPreview.error}</p>
                  ) : null}
                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      disabled={(remediationPlanPreview?.cappedCount ?? 0) === 0}
                      onClick={() => void runRemediation()}
                    >
                      Start remediation ({remediationPlanPreview?.cappedCount ?? 0}{" "}
                      items)
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowRemediationConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </StatusMessage>
              ) : null}
              {state.aiQueue.running ? (
                <p className="text-sm" aria-live="polite">
                  AI progress: {state.aiQueue.completed} / {state.aiQueue.total}{" "}
                  (succeeded {state.aiQueue.succeeded}, failed{" "}
                  {state.aiQueue.failed})
                  <Button
                    type="button"
                    variant="secondary"
                    className="ml-2"
                    onClick={() => {
                      aiCancelRef.current = true;
                      dispatch({ type: "AI_QUEUE_CANCEL" });
                    }}
                  >
                    Stop remaining
                  </Button>
                </p>
              ) : null}
              {state.remediationQueue.running ? (
                <p className="text-sm" aria-live="polite">
                  Remediation progress: {state.remediationQueue.completed} /{" "}
                  {state.remediationQueue.total} (succeeded{" "}
                  {state.remediationQueue.succeeded}, failed{" "}
                  {state.remediationQueue.failed})
                  <Button
                    type="button"
                    variant="secondary"
                    className="ml-2"
                    onClick={() => {
                      remediationCancelRef.current = true;
                      dispatch({ type: "REMEDIATION_QUEUE_CANCEL" });
                    }}
                  >
                    Stop remaining
                  </Button>
                </p>
              ) : null}
              <BatchResultsTable
                pageItems={pageItems}
                selectedIds={state.selectedIds}
                onToggle={(id) => dispatch({ type: "TOGGLE_SELECTION", id })}
                onOpenDetail={setDetailId}
                onSelectFiltered={() =>
                  dispatch({
                    type: "SELECT_FILTERED",
                    ids: filtered.map((i) => i.id),
                  })
                }
              />
              <Pagination
                page={state.page}
                totalPages={totalPages}
                pageSize={state.pageSize}
                onPage={(p) => dispatch({ type: "SET_PAGE", page: p })}
                onPageSize={(s) =>
                  dispatch({ type: "SET_PAGE_SIZE", pageSize: s })
                }
              />
              <ExportPanel
                privacy={exportPrivacy}
                onPrivacy={setExportPrivacy}
                onResults={() =>
                  downloadBatchResultsCsv(state.items, exportPrivacy)
                }
                onPublishing={() => downloadPublishingCsv(state.items)}
                onReview={() => downloadReviewQueueCsv(state.items)}
                onJson={() =>
                  downloadBatchJson({
                    sessionId: state.sessionId,
                    metadata: state.metadata,
                    summary: state.summary,
                    items: state.items,
                  })
                }
              />
              <BulkFixPanel
                fixId={bulkFixId}
                onFixId={setBulkFixId}
                onPreview={() =>
                  previewBulkFix(
                    state.items.filter((i) => state.selectedIds.has(i.id)),
                    bulkFixId,
                  )
                }
                onApply={() => {
                  const { items, undo } = applyBulkFix(
                    state.items,
                    [...state.selectedIds],
                    bulkFixId,
                  );
                  dispatch({ type: "SET_ITEMS", items });
                  dispatch({ type: "SET_BULK_FIX_UNDO", undo: { itemIds: undo.map((u) => u.id), snapshots: undo } });
                }}
                onUndo={() => {
                  if (state.bulkFixUndo) {
                    dispatch({
                      type: "SET_ITEMS",
                      items: undoBulkFix(state.items, state.bulkFixUndo.snapshots),
                    });
                    dispatch({ type: "SET_BULK_FIX_UNDO", undo: null });
                  }
                }}
                canUndo={Boolean(state.bulkFixUndo)}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (
                    window.confirm(
                      "This will remove all imported content and analysis results from the current session.",
                    )
                  ) {
                    revokeAllBatchImageUrls(state.items);
                    dispatch({ type: "CLEAR_BATCH" });
                  }
                }}
              >
                Clear entire batch
              </Button>
            </>
          ) : null}
        </>
      ) : null}

      {detailItem ? (
        <BatchItemDetail
          item={detailItem}
          onClose={() => setDetailId(null)}
          onOpenChecker={() => {
            const id = createBatchCheckerHandoff(detailItem);
            router.push(checkerHandoffPath(id));
          }}
          onApplyAlt={(text) => {
            dispatch({
              type: "UPDATE_ITEM",
              id: detailItem.id,
              patch: { altText: text, altTextSource: "ai_applied" },
            });
          }}
        />
      ) : null}
    </div>
  );
}

function BatchSummaryBar({
  summary,
}: {
  summary: ReturnType<typeof computeBatchSessionSummary>;
}) {
  return (
    <AppPanel title="Batch summary">
      <p className="font-display text-lg font-bold">{summary.batchOverallLabel}</p>
      <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <li>Total: {summary.totalItems}</li>
        <li>Ready: {summary.ready}</li>
        <li>Review: {summary.needsReview}</li>
        <li>Attention: {summary.attention}</li>
        <li>AI completed: {summary.aiCompleted}</li>
        <li>Missing alt: {summary.missingAltText}</li>
        {summary.averageLocalScore != null ? (
          <li>Average local readiness: {summary.averageLocalScore}/100</li>
        ) : null}
      </ul>
    </AppPanel>
  );
}

function BatchFilters({
  state,
  dispatch,
  filteredCount,
}: {
  state: ReturnType<typeof useBatchSession>["state"];
  dispatch: ReturnType<typeof useBatchSession>["dispatch"];
  filteredCount: number;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="text-sm">
        Filter
        <select
          className="ml-2 rounded-lg border border-border px-2 py-1"
          value={state.filter}
          onChange={(e) =>
            dispatch({
              type: "SET_FILTER",
              filter: e.target.value as typeof state.filter,
            })
          }
        >
          <option value="all">All</option>
          <option value="ready">Ready</option>
          <option value="review">Review</option>
          <option value="attention">Attention</option>
          <option value="has_image">Has image</option>
          <option value="missing_alt">Missing alt text</option>
          <option value="ai_not_run">AI not run</option>
          <option value="ai_completed">AI completed</option>
          <option value="image_missing">Image missing</option>
        </select>
      </label>
      <label className="text-sm">
        Search
        <input
          className="ml-2 rounded-lg border border-border px-2 py-1"
          value={state.searchQuery}
          onChange={(e) =>
            dispatch({ type: "SET_SEARCH", query: e.target.value })
          }
        />
      </label>
      <p className="text-xs text-muted">{filteredCount} matching rows</p>
    </div>
  );
}

function BatchBulkBar({
  selectedCount,
  onClear,
  onAi,
  onRemediation,
  onRemove,
}: {
  selectedCount: number;
  onClear: () => void;
  onAi: () => void;
  onRemediation: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-md">
      <span className="text-sm font-semibold">{selectedCount} selected</span>
      <Button type="button" onClick={onAi}>
        Run AI image review
      </Button>
      <Button type="button" variant="secondary" onClick={onRemediation}>
        AI remediation (selected)
      </Button>
      <Button type="button" variant="secondary" onClick={onRemove}>
        Remove selected
      </Button>
      <Button type="button" variant="ghost" onClick={onClear}>
        Clear selection
      </Button>
    </div>
  );
}

function BatchResultsTable({
  pageItems,
  selectedIds,
  onToggle,
  onOpenDetail,
  onSelectFiltered,
}: {
  pageItems: BatchAccessibilityItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onSelectFiltered: () => void;
}) {
  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th scope="col" className="p-2">
                <Button type="button" variant="ghost" onClick={onSelectFiltered}>
                  Select filtered
                </Button>
              </th>
              <th scope="col">ID</th>
              <th scope="col">Platform</th>
              <th scope="col">Score</th>
              <th scope="col">Status</th>
              <th scope="col">AI</th>
              <th scope="col">Contrast</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => (
              <tr key={item.id} className="border-b border-border">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    aria-label={`Select post ${item.id}`}
                    onChange={() => onToggle(item.id)}
                  />
                </td>
                <td className="p-2">
                  <button
                    type="button"
                    className="font-semibold text-primary underline"
                    onClick={() => onOpenDetail(item.id)}
                  >
                    {item.id}
                  </button>
                </td>
                <td className="p-2">{item.platform ?? "—"}</td>
                <td className="p-2">{item.localAnalysis?.phase1.score ?? "—"}</td>
                <td className="p-2">{item.overallStatus}</td>
                <td className="p-2">{item.ai.status}</td>
                <td className="p-2">{item.visualStatus.contrast}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden">
        {pageItems.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-border bg-card p-3"
          >
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={selectedIds.has(item.id)}
                aria-label={`Select post ${item.id}`}
                onChange={() => onToggle(item.id)}
              />
              <span>
                <button
                  type="button"
                  className="font-semibold text-primary"
                  onClick={() => onOpenDetail(item.id)}
                >
                  {item.id}
                </button>
                <span className="block text-muted">{item.overallStatus}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}

function Pagination({
  page,
  totalPages,
  pageSize,
  onPage,
  onPageSize,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Button
        type="button"
        variant="secondary"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Previous
      </Button>
      <span>
        Page {page} / {totalPages}
      </span>
      <Button
        type="button"
        variant="secondary"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        Next
      </Button>
      <select
        className="rounded-lg border border-border px-2 py-1"
        value={pageSize}
        onChange={(e) => onPageSize(Number(e.target.value))}
      >
        {BATCH_PAGE_SIZE_OPTIONS.map((n) => (
          <option key={n} value={n}>
            {n} / page
          </option>
        ))}
      </select>
    </div>
  );
}

function ExportPanel({
  privacy,
  onPrivacy,
  onResults,
  onPublishing,
  onReview,
  onJson,
}: {
  privacy: BatchExportPrivacy;
  onPrivacy: (p: BatchExportPrivacy) => void;
  onResults: () => void;
  onPublishing: () => void;
  onReview: () => void;
  onJson: () => void;
}) {
  return (
    <AppPanel title="Export">
      <fieldset className="mb-3 space-y-1 text-sm">
        {(
          [
            ["includeCaptions", "Include captions"],
            ["includeAltText", "Include alt text"],
            ["includeAiSuggestions", "Include AI suggestions"],
            ["includeClientMetadata", "Include client metadata"],
            ["includeInternalNotes", "Include internal notes"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex gap-2">
            <input
              type="checkbox"
              checked={privacy[key]}
              onChange={(e) =>
                onPrivacy({ ...privacy, [key]: e.target.checked })
              }
            />
            {label}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={onResults}>
          Download results CSV
        </Button>
        <Button type="button" variant="secondary" onClick={onPublishing}>
          Download publishing CSV
        </Button>
        <Button type="button" variant="secondary" onClick={onReview}>
          Download review queue CSV
        </Button>
        <Button type="button" variant="secondary" onClick={onJson}>
          Download batch JSON
        </Button>
      </div>
    </AppPanel>
  );
}

function BulkFixPanel({
  fixId,
  onFixId,
  onPreview,
  onApply,
  onUndo,
  canUndo,
}: {
  fixId: BulkFixId;
  onFixId: (id: BulkFixId) => void;
  onPreview: () => { id: string; before: string; after: string }[];
  onApply: () => void;
  onUndo: () => void;
  canUndo: boolean;
}) {
  const [preview, setPreview] = useState<
    { id: string; before: string; after: string }[] | null
  >(null);
  return (
    <AppPanel title="Bulk deterministic fixes">
      <select
        className="rounded-lg border border-border px-2 py-1 text-sm"
        value={fixId}
        onChange={(e) => onFixId(e.target.value as BulkFixId)}
      >
        <option value="fancy-unicode-normalize">Normalize fancy Unicode</option>
        <option value="reduce-punctuation">Reduce repeated punctuation</option>
        <option value="reduce-emoji-runs">Reduce repeated emoji</option>
      </select>
      <div className="mt-2 flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setPreview(onPreview())}
        >
          Preview on selected
        </Button>
        <Button type="button" onClick={onApply}>
          Apply to selected
        </Button>
        {canUndo ? (
          <Button type="button" variant="ghost" onClick={onUndo}>
            Undo bulk fix
          </Button>
        ) : null}
      </div>
      {preview?.length ? (
        <ul className="mt-2 max-h-40 overflow-auto text-xs text-muted">
          {preview.slice(0, 8).map((p) => (
            <li key={p.id}>
              {p.id}: {p.before} → {p.after}
            </li>
          ))}
        </ul>
      ) : null}
    </AppPanel>
  );
}

function BatchItemDetail({
  item,
  onClose,
  onOpenChecker,
  onApplyAlt,
}: {
  item: BatchAccessibilityItem;
  onClose: () => void;
  onOpenChecker: () => void;
  onApplyAlt: (text: string) => void;
}) {
  const source = batchItemToReportSource(item);
  return (
    <AppPanel title={`Item ${item.id}`}>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={onOpenChecker}>
          Open in full checker
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm">{item.caption}</p>
      {item.ai.analysis?.suggestedAltText ? (
        <div className="mt-3">
          <p className="text-sm font-semibold">Suggested alt text</p>
          <p className="text-sm">{item.ai.analysis.suggestedAltText}</p>
          <Button
            type="button"
            className="mt-2"
            onClick={() => onApplyAlt(item.ai.analysis!.suggestedAltText)}
          >
            Use suggestion
          </Button>
        </div>
      ) : null}
      {item.localAnalysis ? (
        <PreflightReportGenerator source={source} heading="Item preflight report" />
      ) : null}
    </AppPanel>
  );
}
