"use client";

import { use } from "react";
import { ProjectWizard } from "@/components/modules/projects";
import { Id } from "@convex/_generated/dataModel";

interface OnboardingPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function OnboardingPage({ params }: OnboardingPageProps) {
  const { projectId } = use(params);

  return (
    <div className="flex-1">
      <ProjectWizard
        mode="onboarding"
        initialProjectId={projectId as Id<"projects">}
      />
    </div>
  );
}
