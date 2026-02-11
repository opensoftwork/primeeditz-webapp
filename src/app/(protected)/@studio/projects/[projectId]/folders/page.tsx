"use client";

import { use } from "react";
import { FolderListingView } from "@/components/modules/projects/folders/folder-listing-view";

interface ProjectFoldersPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function ProjectFoldersPage({
  params,
}: ProjectFoldersPageProps) {
  const { projectId } = use(params);

  return <FolderListingView projectId={projectId} />;
}
