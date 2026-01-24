"use client";

import { use } from "react";
import { FolderListingView } from "@/components/modules/projects/folders/folder-listing-view";

interface EmployeeProjectFoldersPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

/**
 * Employee Project Folders Page
 * Provides access to project assets for creative staff.
 */
export default function EmployeeProjectFoldersPage({
  params,
}: EmployeeProjectFoldersPageProps) {
  const { projectId } = use(params);

  return (
    <div className="p-8 md:p-12">
      <FolderListingView projectId={projectId} isEmployee />
    </div>
  );
}
