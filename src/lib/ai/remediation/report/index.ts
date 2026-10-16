export {
  buildReportAiRemediationAppendix,
  aiRemediationIncludedSummaryLine,
  dedupeReportAiCandidates,
  type AiRemediationSelectionInput,
} from "@/lib/ai/remediation/report/buildReportAiRemediationAppendix";
export { collectWebsiteRemediationCandidates } from "@/lib/ai/remediation/report/collectWebsiteRemediationCandidates";
export {
  collectSocialRemediationCandidate,
  collectImageRemediationCandidate,
  collectContrastRemediationCandidate,
  collectVideoCueRemediationCandidates,
  collectBatchRemediationCandidate,
  collectAllFromReportSource,
} from "@/lib/ai/remediation/report/collectFromReportSource";
export {
  toExportableAiRemediationJson,
  type ExportableAiRemediationJsonEntry,
} from "@/lib/ai/remediation/report/toExportableAiRemediationJson";
export { formatAiRemediationAppendixMarkdown } from "@/lib/ai/remediation/report/formatAiRemediationAppendixMarkdown";
export {
  formatAiRemediationAppendixPlainText,
  formatAiRemediationEntryPlainText,
} from "@/lib/ai/remediation/report/formatAiRemediationForPlainText";
export {
  formatAiRemediationForExcelRow,
  AI_REMEDIATION_EXCEL_HEADERS,
} from "@/lib/ai/remediation/report/formatAiRemediationForExcelRow";
export {
  formatAiRemediationForCsvRow,
  AI_REMEDIATION_CSV_HEADERS,
} from "@/lib/ai/remediation/report/formatAiRemediationForCsvRow";
export { escapeHtml } from "@/lib/ai/remediation/report/escapeHtml";
