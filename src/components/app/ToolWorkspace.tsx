"use client";

import type { ReactNode } from "react";
import { ToolStepNav, type ToolStep } from "@/components/app/ToolStepNav";

type ToolWorkspaceProps = {
  steps: ToolStep[];
  activeStepId?: string;
  toolbar?: ReactNode;
  children: ReactNode;
};

export function ToolWorkspace({
  steps,
  activeStepId = steps[0]?.id,
  toolbar,
  children,
}: ToolWorkspaceProps) {
  return (
    <div className="space-y-6 lg:space-y-8">
      <ToolStepNav steps={steps} activeStepId={activeStepId} />
      {toolbar}
      <div className="space-y-8 lg:space-y-10">{children}</div>
    </div>
  );
}
