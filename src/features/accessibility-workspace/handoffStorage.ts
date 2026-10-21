import type {
  ReportContribution,
  ToolHandoffContext,
} from "@/features/accessibility-workspace/types";
import { upsertContributionList } from "@/features/accessibility-workspace/upsertContribution";

const HANDOFF_KEY = "acps_workspace_handoff_v1";
const PENDING_CONTRIBUTIONS_KEY = "acps_workspace_pending_contributions_v1";
const WORKSPACE_SNAPSHOT_KEY = "acps_workspace_snapshot_v1";

const HANDOFF_MAX_AGE_MS = 1000 * 60 * 60 * 8;

type PendingContributionsEnvelope = {
  version: 1;
  items: ReportContribution[];
};

function storageAvailable(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    const probe = "__acps_probe__";
    sessionStorage.setItem(probe, "1");
    sessionStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function parseHandoff(raw: string): ToolHandoffContext | null {
  try {
    const parsed = JSON.parse(raw) as ToolHandoffContext;
    if (parsed?.version !== 1 || !parsed.returnTo?.findingId) return null;
    const created = Date.parse(parsed.createdAt);
    if (Number.isFinite(created) && Date.now() - created > HANDOFF_MAX_AGE_MS) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function parsePendingEnvelope(raw: string): ReportContribution[] {
  try {
    const parsed = JSON.parse(raw) as PendingContributionsEnvelope | ReportContribution[];
    if (Array.isArray(parsed)) return parsed.filter(isContributionShape);
    if (parsed?.version === 1 && Array.isArray(parsed.items)) {
      return parsed.items.filter(isContributionShape);
    }
    return [];
  } catch {
    return [];
  }
}

function isContributionShape(value: unknown): value is ReportContribution {
  if (!value || typeof value !== "object") return false;
  const c = value as ReportContribution;
  return (
    typeof c.contributionId === "string" &&
    typeof c.toolId === "string" &&
    typeof c.includedInReport === "boolean"
  );
}

export function writeToolHandoff(handoff: ToolHandoffContext): void {
  if (!storageAvailable()) return;
  sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(handoff));
}

export function readToolHandoff(): ToolHandoffContext | null {
  if (!storageAvailable()) return null;
  const raw = sessionStorage.getItem(HANDOFF_KEY);
  if (!raw) return null;
  const parsed = parseHandoff(raw);
  if (!parsed) sessionStorage.removeItem(HANDOFF_KEY);
  return parsed;
}

export function clearToolHandoff(): void {
  if (!storageAvailable()) return;
  sessionStorage.removeItem(HANDOFF_KEY);
}

export function queuePendingContribution(contribution: ReportContribution): void {
  if (!storageAvailable()) return;
  const list = readPendingContributions();
  const next = upsertContributionList(list, contribution);
  const envelope: PendingContributionsEnvelope = { version: 1, items: next };
  sessionStorage.setItem(PENDING_CONTRIBUTIONS_KEY, JSON.stringify(envelope));
}

export function readPendingContributions(): ReportContribution[] {
  if (!storageAvailable()) return [];
  const raw = sessionStorage.getItem(PENDING_CONTRIBUTIONS_KEY);
  if (!raw) return [];
  return parsePendingEnvelope(raw);
}

export function clearPendingContributions(): void {
  if (!storageAvailable()) return;
  sessionStorage.removeItem(PENDING_CONTRIBUTIONS_KEY);
}

export function persistWorkspaceContributions(contributions: ReportContribution[]): void {
  if (!storageAvailable()) return;
  sessionStorage.setItem(WORKSPACE_SNAPSHOT_KEY, JSON.stringify(contributions));
}

export function readPersistedWorkspaceContributions(): ReportContribution[] {
  if (!storageAvailable()) return [];
  const raw = sessionStorage.getItem(WORKSPACE_SNAPSHOT_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ReportContribution[];
    return Array.isArray(parsed) ? parsed.filter(isContributionShape) : [];
  } catch {
    return [];
  }
}
