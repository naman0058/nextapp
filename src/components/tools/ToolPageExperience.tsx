import type { ReactNode } from "react";
import type { ToolPageId } from "@/config/toolPages";
import { getToolPageById } from "@/config/toolPages";
import { ToolPageLayout } from "@/components/app/ToolPageLayout";
import { ToolEducationPanel } from "@/components/tools/ToolEducationPanel";
import { ToolPremiumHero } from "@/components/tools/ToolPremiumHero";
import { ToolSwitcherNav } from "@/components/tools/ToolSwitcherNav";
import { ToolRelatedResources } from "@/components/tools/ToolRelatedResources";
import { ToolWorkspaceFrame } from "@/components/tools/ToolWorkspaceFrame";

type ToolPageExperienceProps = {
  toolId: ToolPageId;
  children: ReactNode;
  afterWorkspace?: ReactNode;
};

export function ToolPageExperience({
  toolId,
  children,
  afterWorkspace,
}: ToolPageExperienceProps) {
  const tool = getToolPageById(toolId);

  return (
    <>
      <ToolPremiumHero tool={tool} />
      <ToolPageLayout>
        <div className="space-y-10 lg:space-y-12">
          <ToolSwitcherNav activePath={tool.path} />
          <ToolWorkspaceFrame>{children}</ToolWorkspaceFrame>
          {afterWorkspace}
          <ToolEducationPanel
            whatItChecks={tool.whatItChecks}
            whatItDoesNot={tool.whatItDoesNot}
          />
          <ToolRelatedResources path={tool.path} />
        </div>
      </ToolPageLayout>
    </>
  );
}
