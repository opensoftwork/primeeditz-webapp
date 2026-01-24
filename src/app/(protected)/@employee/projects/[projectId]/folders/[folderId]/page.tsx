"use client";

import { use } from "react";
import { FolderDetailView } from "@/components/modules/projects/detail/folder";

interface EmployeeFolderPageProps {
  params: Promise<{
    projectId: string;
    folderId: string;
  }>;
}

/**
 * Employee Folder Detail Page
 * Enables creative staff to view and manage specific project folders.
 */
export default function EmployeeFolderPage({ params }: EmployeeFolderPageProps) {
  const { projectId, folderId } = use(params);

  return <FolderDetailView projectId={projectId} folderId={folderId} isEmployee />;
}
