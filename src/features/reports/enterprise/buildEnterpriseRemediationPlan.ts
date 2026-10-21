import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { EnterpriseRemediationPlanItem } from "@/features/reports/enterprise/types";
import type { SupportedFramework } from "@/features/website-scanner/remediation/types";
import {
  getDeterministicRemediation,
  hasFullDeterministicRemediation,
} from "@/features/website-scanner/remediation/registry";

const MAX_STEPS = 6;
const MAX_CODE_CHARS = 3500;

function pickFramework(
  def: NonNullable<ReturnType<typeof getDeterministicRemediation>>,
  preferred?: SupportedFramework | null,
): SupportedFramework | undefined {
  if (preferred && def.supportedFrameworks.includes(preferred)) return preferred;
  if (def.examples?.html) return "html";
  for (const fw of def.supportedFrameworks) {
    if (def.examples?.[fw]) return fw;
  }
  return undefined;
}

function pickCodeExample(
  def: NonNullable<ReturnType<typeof getDeterministicRemediation>>,
  framework?: SupportedFramework,
): { framework: SupportedFramework; code: string } | undefined {
  if (!framework) return undefined;
  const code = def.examples?.[framework];
  if (!code?.trim()) return undefined;
  return { framework, code: code.trim().slice(0, MAX_CODE_CHARS) };
}

export function buildEnterpriseRemediationPlan(input: {
  intel: SiteScanIntelligence | null | undefined;
  preferredFramework?: SupportedFramework | null;
}): EnterpriseRemediationPlanItem[] {
  const intel = input.intel;
  if (!intel?.rootCauseGroups?.length) return [];

  const seen = new Set<string>();
  const items: EnterpriseRemediationPlanItem[] = [];

  for (const group of intel.rootCauseGroups) {
    const ruleId = group.ruleId;
    const agg = intel.ruleAggregates.find((r) => r.ruleId === ruleId);
    if (agg?.isBestPractice) continue;
    if (seen.has(ruleId)) continue;
    seen.add(ruleId);

    const def = getDeterministicRemediation(ruleId);
    const findingId = group.id;
    const remediationGroupId = group.id;

    if (!def) {
      items.push({
        remediationGroupId,
        findingId,
        ruleId,
        definitionId: null,
        definitionVersion: null,
        title: group.label,
        summary: "Deterministic remediation guidance is not yet available for this rule.",
        whyItWorks: null,
        implementationSteps: [
          "Review axe documentation and retained evidence for this rule.",
          "Apply fixes in source code and rescan to verify automated detection.",
        ],
        selectedFramework: null,
        codeExample: null,
        verificationSteps: ["Rescan affected pages after changes."],
        specializedTool: null,
        manualReviewStillRequired: true,
        hasFullDeterministicGuidance: false,
      });
      continue;
    }

    const framework = pickFramework(def, input.preferredFramework ?? null);
    const code = pickCodeExample(def, framework);
    const steps = def.remediationSteps.slice(0, MAX_STEPS);

    items.push({
      remediationGroupId,
      findingId,
      ruleId,
      definitionId: def.ruleId,
      definitionVersion: def.definitionVersion,
      title: def.title,
      summary: def.shortProblem,
      whyItWorks: def.whyThisWorks ?? def.whyItMatters,
      implementationSteps: steps,
      selectedFramework: code?.framework ?? framework ?? null,
      codeExample: code?.code ?? null,
      verificationSteps: def.verificationSteps.map((s) => s.text).slice(0, 8),
      specializedTool: def.specializedTool
        ? { id: def.specializedTool.id, label: def.specializedTool.label, href: def.specializedTool.href }
        : null,
      manualReviewStillRequired: Boolean(def.requiresHumanJudgment),
      hasFullDeterministicGuidance: hasFullDeterministicRemediation(ruleId),
    });
  }

  return items;
}
