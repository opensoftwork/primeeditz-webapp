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

import { ConvexErrorBoundary } from "./convex-error-boundary";

function ProjectBreadcrumbContent({
  children,
  projectId,
}: {
  children: React.ReactNode;
  projectId: string;
}) {
  const { setOverride, removeOverride } = useBreadcrumbStore();
  // @ts-ignore
  const project = useQuery(api.functions.projects.queries.getProject, {
    projectId: projectId as Id<"projects">,
  });

  const profile = useQuery(api.profiles.getMyProfile);

  useEffect(() => {
    // Initial loading state or if project not found yet
    if (project === undefined && projectId) {
      setOverride(projectId, "Project");
      return;
    }

    if (project) {
      const label =
        project.eventName ||
        project.endClientName ||
        project.projectTypeName ||
        project.code;
      if (label) {
        setOverride(projectId, label);
      }
    } else if (project === null && projectId) {
      // Not found or access denied
      setOverride(projectId, "Project");
    }
  }, [projectId, project, setOverride]);

  useEffect(() => {
    if (profile) {
      if (profile.role === "admin") {
        setOverride("projects", "All Projects");
      } else if (profile.role === "studio") {
        setOverride("projects", "My Projects");
      } else if (profile.role === "employee") {
        setOverride("assigned-work", "Assigned Work");
        setOverride("projects", "Projects");
      }
    }
  }, [profile, setOverride]);

  useEffect(() => {
    return () => {
      // Only remove the specific project ID override on unmount
      // Keep shared section overrides to prevent flickering
      removeOverride(projectId);
    };
  }, [projectId, removeOverride]);

  return <>{children}</>;
}

export function ProjectBreadcrumbLayout({
  children,
  params,
}: ProjectBreadcrumbLayoutProps) {
  const { projectId } = use(params);

  return (
    <ProjectBreadcrumbContent projectId={projectId}>
      {children}
    </ProjectBreadcrumbContent>
  );
}
