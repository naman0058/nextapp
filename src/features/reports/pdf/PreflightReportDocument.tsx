import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";
import type { ReportSection } from "@/features/reports/types/reportModel";
import { reportStatusLabel } from "@/features/reports/types/reportStatus";
import { APPLICATION_NAME } from "@/features/reports/constants/reportVersion";
import { PDF_UA_NOTE } from "@/features/reports/constants/disclaimer";
import { MAX_TRANSCRIPT_CHARS_IN_PDF } from "@/features/reports/types/reportSettings";
import type { ReportAiRemediationEntry } from "@/features/reports/types/reportAiRemediation";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  h1: { fontSize: 18, marginBottom: 8 },
  h2: { fontSize: 12, marginTop: 12, marginBottom: 4 },
  muted: { color: "#555", marginBottom: 4 },
  item: { marginBottom: 6, paddingBottom: 4, borderBottom: "1pt solid #eee" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#666" },
  code: {
    fontFamily: "Courier",
    fontSize: 8,
    marginTop: 4,
    marginBottom: 4,
    padding: 4,
    backgroundColor: "#f5f5f5",
  },
});

function PdfSection({ section }: { section: ReportSection }) {
  return (
    <View>
      <Text style={styles.h2}>{section.title}</Text>
      <Text style={styles.muted}>Status: {section.sectionStatus}</Text>
      {section.findings.map((f) => (
        <View key={f.id} style={styles.item}>
          <Text>
            {f.title} ({reportStatusLabel(f.status)})
          </Text>
          <Text>{f.finding}</Text>
          {f.recommendation ? <Text style={styles.muted}>{f.recommendation}</Text> : null}
        </View>
      ))}
    </View>
  );
}

function PdfAiEntry({ entry }: { entry: ReportAiRemediationEntry }) {
  const r = entry.remediation;
  return (
    <View style={styles.item} wrap>
      <Text style={{ fontWeight: "bold" }}>{entry.title}</Text>
      <Text style={styles.muted}>
        AI-Assisted · Source: {entry.source}
        {entry.sampleLabel ? ` · ${entry.sampleLabel}` : ""}
      </Text>
      {entry.stale ? (
        <Text>Stale guidance — {entry.staleReason ?? "Previous scan"}</Text>
      ) : null}
      {entry.facts?.ruleId ? (
        <Text style={styles.muted}>Rule (deterministic): {entry.facts.ruleId}</Text>
      ) : null}
      <Text>{r.problemSummary}</Text>
      {r.suggestedContent ? (
        <Text>Suggested: {r.suggestedContent.slice(0, 2000)}</Text>
      ) : null}
      {r.suggestedCode?.code ? (
        <>
          <Text style={styles.muted}>Possible implementation pattern</Text>
          <Text style={styles.code}>{r.suggestedCode.code.slice(0, 4000)}</Text>
        </>
      ) : null}
    </View>
  );
}

type PreflightReportDocumentProps = {
  report: AccessibilityPreflightReport;
  sampleBanner?: string;
};

export function PreflightReportDocument({ report, sampleBanner }: PreflightReportDocumentProps) {
  const sections = [
    report.textAccessibility,
    report.imageAccessibility,
    report.visualAccessibility,
    report.screenReaderPreview,
    report.videoAccessibility,
    report.platformPublishing,
  ].filter(Boolean) as ReportSection[];

  const transcript =
    report.fullTranscript &&
    report.fullTranscript.length <= MAX_TRANSCRIPT_CHARS_IN_PDF
      ? report.fullTranscript
      : null;
  const transcriptBlocked =
    report.fullTranscript &&
    report.fullTranscript.length > MAX_TRANSCRIPT_CHARS_IN_PDF;

  return (
    <Document title={report.projectInfo.reportTitle ?? "Preflight Report"}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.muted}>{APPLICATION_NAME}</Text>
        {sampleBanner ? (
          <Text style={{ fontSize: 12, marginBottom: 6, color: "#b45309" }}>
            {sampleBanner}
          </Text>
        ) : null}
        <Text style={styles.h1}>
          {report.projectInfo.reportTitle?.trim() ||
            "Accessibility Preflight Report"}
        </Text>
        <Text style={styles.muted}>Report ID: {report.reportId}</Text>
        <Text style={styles.muted}>Generated: {report.generatedAtDisplay}</Text>
        <Text style={styles.muted}>Overall: {report.summary.overallStatus}</Text>
        <Text style={styles.h2}>Executive summary</Text>
        <Text>
          {report.summary.checksCompleted} checks; {report.summary.itemsReady}{" "}
          ready; {report.summary.itemsRequiringReview} review;{" "}
          {report.summary.importantIssues} important.
        </Text>
        {report.finalWorkingCaption ? (
          <>
            <Text style={styles.h2}>Working caption</Text>
            <Text>{report.finalWorkingCaption.slice(0, 4000)}</Text>
          </>
        ) : null}
        {report.altText ? (
          <>
            <Text style={styles.h2}>Alt text</Text>
            <Text>{report.altText}</Text>
          </>
        ) : null}
        {sections.map((s) => (
          <PdfSection key={s.id} section={s} />
        ))}
        {transcript ? (
          <>
            <Text style={styles.h2}>Full transcript</Text>
            <Text>{transcript}</Text>
          </>
        ) : null}
        {transcriptBlocked ? (
          <Text style={styles.muted}>
            Full transcript exceeds PDF limit ({MAX_TRANSCRIPT_CHARS_IN_PDF}{" "}
            characters). Use JSON export or Print Report.
          </Text>
        ) : null}
        {report.aiRemediationAppendix ? (
          <View wrap>
            <Text style={styles.h2}>AI-Assisted Remediation Appendix</Text>
            <Text style={styles.muted}>{report.aiRemediationAppendix.intro}</Text>
            {report.aiRemediationAppendix.entries.map((entry) => (
              <PdfAiEntry key={entry.id} entry={entry} />
            ))}
          </View>
        ) : null}
        <Text style={styles.footer}>
          {report.disclaimer} {PDF_UA_NOTE}
        </Text>
      </Page>
    </Document>
  );
}
