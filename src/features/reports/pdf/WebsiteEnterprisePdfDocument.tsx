import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";
import { PDF_UA_NOTE } from "@/features/reports/constants/disclaimer";
import {
  ENTERPRISE_BRAND_NAME,
  ENTERPRISE_TAGLINE,
} from "@/features/reports/enterprise/constants";

const styles = StyleSheet.create({
  page: { padding: 44, fontSize: 10, fontFamily: "Helvetica", color: "#111" },
  brand: { fontSize: 9, color: "#444", marginBottom: 4 },
  h1: { fontSize: 20, marginBottom: 4, fontWeight: "bold" },
  h2: { fontSize: 12, marginTop: 14, marginBottom: 6, fontWeight: "bold" },
  h3: { fontSize: 10, marginTop: 8, marginBottom: 4, fontWeight: "bold" },
  muted: { color: "#555", marginBottom: 4, lineHeight: 1.35 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  box: { border: "1pt solid #ddd", padding: 8, marginBottom: 8 },
  badge: {
    fontSize: 8,
    backgroundColor: "#eee",
    padding: 2,
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    fontSize: 7,
    color: "#666",
  },
  code: { fontFamily: "Courier", fontSize: 8 },
});

type Props = {
  report: AccessibilityPreflightReport;
  sampleBanner?: string;
};

export function WebsiteEnterprisePdfDocument({ report, sampleBanner }: Props) {
  const e = report.enterpriseView;
  if (!e) {
    return (
      <Document title="Preflight Report">
        <Page size="A4" style={styles.page}>
          <Text>Enterprise report view unavailable.</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document title="Accessibility Preflight Report">
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.brand}>{ENTERPRISE_BRAND_NAME}</Text>
        {sampleBanner ? <Text style={{ color: "#b45309", marginBottom: 6 }}>{sampleBanner}</Text> : null}
        <Text style={styles.h1}>Accessibility Preflight Report</Text>
        <Text style={styles.muted}>{ENTERPRISE_TAGLINE}</Text>
        <Text style={styles.muted}>Target: {e.scope.targetUrl}</Text>
        <Text style={styles.muted}>Generated: {e.reportMeta.generatedAtDisplay}</Text>
        <Text style={styles.muted}>Report ID: {e.reportMeta.reportId}</Text>

        <Text style={styles.h2}>Executive summary</Text>
        <Text style={{ fontWeight: "bold", marginBottom: 4 }}>{e.executiveSummary.statusPhrase}</Text>
        <Text style={styles.muted}>{e.executiveSummary.shortNote}</Text>
        {e.executiveSummary.zeroFindingNote ? (
          <Text style={styles.muted}>{e.executiveSummary.zeroFindingNote}</Text>
        ) : null}
        {e.scope.partialScanNote ? (
          <Text style={styles.muted}>Coverage limitation: {e.scope.partialScanNote}</Text>
        ) : null}

        <View style={styles.box}>
          <View style={styles.row}>
            <Text>Failed automated rules</Text>
            <Text>{e.counters.failedAutomatedRules}</Text>
          </View>
          <View style={styles.row}>
            <Text>Affected occurrences</Text>
            <Text>{e.counters.affectedOccurrences}</Text>
          </View>
          <View style={styles.row}>
            <Text>Needs manual confirmation</Text>
            <Text>{e.counters.needsManualConfirmation}</Text>
          </View>
          <View style={styles.row}>
            <Text>Human review</Text>
            <Text>
              {e.counters.humanReviewReviewed} of {e.counters.humanReviewRelevant} reviewed
            </Text>
          </View>
          <View style={styles.row}>
            <Text>Pages scanned</Text>
            <Text>{e.counters.pagesScanned}</Text>
          </View>
        </View>

        <Text style={styles.h2}>Coverage</Text>
        {e.coverage.map((c) => (
          <View key={c.id} style={{ marginBottom: 6 }}>
            <Text style={{ fontWeight: "bold" }}>{c.label}</Text>
            <Text>{c.statusLabel}</Text>
            <Text style={styles.muted}>{c.detail}</Text>
          </View>
        ))}

        {e.priorities.length > 0 && (
          <>
            <Text style={styles.h2}>Top remediation priorities</Text>
            {e.priorities.map((p) => (
              <View key={p.id} style={styles.box} wrap={false}>
                <Text style={styles.h3}>{p.title}</Text>
                <Text style={styles.muted}>
                  {p.impact} · {p.priority}
                  {p.primaryWcagCriterion ? ` · WCAG ${p.primaryWcagCriterion}` : ""}
                </Text>
                <Text>
                  {p.totalOccurrences} occurrences · {p.pagesAffected} page(s)
                </Text>
                <Text style={styles.muted}>{p.whyItMatters}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.footer}>
          {e.disclaimer} {PDF_UA_NOTE}
        </Text>
      </Page>

      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.h2}>Automated findings</Text>
        {e.automatedFindings.map((f) => (
          <View key={f.findingId} style={styles.box} wrap={false}>
            <Text style={styles.badge}>{f.sourceBadge}</Text>
            <Text style={styles.h3}>{f.title}</Text>
            <Text style={styles.code}>{f.ruleId}</Text>
            <Text style={styles.muted}>
              {f.totalOccurrences} total · {f.retainedEvidenceCount} retained · {f.pdfShownCount}{" "}
              shown in PDF
            </Text>
            <Text>{f.problem}</Text>
            {f.representativeEvidence.slice(0, 3).map((ev) => (
              <Text key={ev.evidenceId} style={styles.muted}>
                {ev.pageUrl} · {ev.selector ?? "—"}
              </Text>
            ))}
          </View>
        ))}

        {e.remediationPlan.length > 0 && (
          <>
            <Text style={styles.h2}>Deterministic remediation plan</Text>
            {e.remediationPlan.map((plan) => (
              <View key={plan.remediationGroupId} style={styles.box} wrap={false}>
                <Text style={styles.h3}>{plan.title}</Text>
                <Text style={styles.muted}>
                  {plan.definitionId ?? plan.ruleId}
                  {plan.definitionVersion != null ? ` v${plan.definitionVersion}` : ""}
                </Text>
                <Text>{plan.summary}</Text>
                {plan.whyItWorks ? <Text style={styles.muted}>{plan.whyItWorks}</Text> : null}
                {plan.implementationSteps.map((step, i) => (
                  <Text key={`${plan.ruleId}-s-${i}`} style={styles.muted}>
                    {i + 1}. {step}
                  </Text>
                ))}
                {plan.codeExample ? (
                  <Text style={styles.code}>{plan.codeExample.slice(0, 2800)}</Text>
                ) : null}
                {plan.verificationSteps.slice(0, 4).map((v, i) => (
                  <Text key={`${plan.ruleId}-v-${i}`} style={styles.muted}>
                    Verify: {v}
                  </Text>
                ))}
              </View>
            ))}
          </>
        )}

        {e.incompleteFindings.length > 0 && (
          <>
            <Text style={styles.h2}>Needs manual confirmation</Text>
            {e.incompleteFindings.map((inc) => (
              <View key={inc.ruleId} style={styles.box}>
                <Text style={styles.h3}>{inc.title}</Text>
                <Text style={styles.muted}>{inc.description}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.h2}>Human review</Text>
        <Text style={styles.muted}>{e.humanReview.disclaimer}</Text>
        {e.humanReview.records.map((r) => (
          <View key={r.reviewId} style={{ marginBottom: 6 }}>
            <Text style={{ fontWeight: "bold" }}>{r.title}</Text>
            <Text>Status: {r.status.replace(/_/g, " ")}</Text>
            {r.applicableScope.representativeLabel ? (
              <Text style={styles.muted}>{r.applicableScope.representativeLabel}</Text>
            ) : null}
          </View>
        ))}

        {e.additionalEvidence.length > 0 && (
          <>
            <Text style={styles.h2}>Additional review evidence</Text>
            {e.additionalEvidence.map((c) => (
              <View key={c.contributionId} style={styles.box}>
                <Text style={styles.badge}>{c.sourceType}</Text>
                <Text>{c.title}</Text>
                <Text style={styles.muted}>{c.summary}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.footer}>{e.disclaimer}</Text>
      </Page>

      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.h2}>Page inventory</Text>
        {e.pageInventory.map((row) => (
          <Text key={row.url} style={styles.muted}>
            {row.url} · {row.viewportLabel} · failed {row.failedRules} · {row.occurrences} occ.
          </Text>
        ))}

        <Text style={styles.h2}>Technical appendix</Text>
        <Text style={styles.muted}>
          Schema {e.reportMeta.reportSchemaVersion} · Report {e.reportMeta.reportVersion} ·
          Remediation library v{e.reportMeta.remediationLibraryVersion} · Human review registry v
          {e.reportMeta.humanReviewRegistryVersion}
        </Text>
        {e.reportMeta.axeVersion ? (
          <Text style={styles.muted}>axe {e.reportMeta.axeVersion}</Text>
        ) : null}
        <Text style={styles.muted}>
          Passed automated rules: {e.counters.passedAutomatedRules}. Not a compliance percentage.
        </Text>

        <Text style={styles.h2}>Methodology</Text>
        {e.methodology.sections.map((s) => (
          <View key={s.title} style={{ marginBottom: 6 }}>
            <Text style={{ fontWeight: "bold" }}>{s.title}</Text>
            {s.bullets.map((b) => (
              <Text key={b.slice(0, 30)} style={styles.muted}>
                • {b}
              </Text>
            ))}
          </View>
        ))}

        <Text style={styles.footer}>
          {ENTERPRISE_BRAND_NAME} · {PDF_UA_NOTE}
        </Text>
      </Page>
    </Document>
  );
}
