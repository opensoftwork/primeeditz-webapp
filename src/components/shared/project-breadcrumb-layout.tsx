"use client";

import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { useEffect, use } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

interface ProjectBreadcrumbLayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export function ProjectBreadcrumbLayout({
  children,
  params,
}: ProjectBreadcrumbLayoutProps) {
  const { projectId } = use(params);
  const { setOverride, removeOverride } = useBreadcrumbStore();

  const project = useQuery(api.functions.projects.queries.getProject, {
    projectId: projectId as Id<"projects">,
  });

  useEffect(() => {
    if (project) {
      const label =
        project.eventName || project.projectTypeName || project.code;
      setOverride(projectId, label);
    }
  }, [projectId, project, setOverride]);

  useEffect(() => {
    return () => removeOverride(projectId);
  }, [projectId, removeOverride]);

  return <>{children}</>;
}
