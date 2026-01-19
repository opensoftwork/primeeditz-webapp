"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

import { FolderGrid } from "@/components/shared/project-folders";

interface ProjectFoldersListProps {
  projectId: Id<"projects">;
}

export function ProjectFoldersList({ projectId }: ProjectFoldersListProps) {
  const router = useRouter();

  const folders = useQuery(api.functions.folders.queries.getProjectFolders, {
    projectId,
  });

  const handleFolderClick = (folder: any) => {
    // Navigate to the dedicated folder page
    router.push(`/projects/${projectId}/folders/${folder._id}`);
  };

  return <FolderGrid folders={folders} onFolderClick={handleFolderClick} />;
}
