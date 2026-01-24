"use client";

import { use } from "react";
import { FolderListingView } from "@/components/modules/projects/folders/folder-listing-view";

interface EmployeeProjectFoldersPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function EmployeeProjectFoldersPage({
  params,
}: EmployeeProjectFoldersPageProps) {
  const { projectId } = use(params);

  return <FolderListingView projectId={projectId} isEmployee />;
}
