"use client";

import { use } from "react";
import { FolderDetailView } from "@/components/modules/projects/detail/folder";

interface EmployeeFolderDetailPageProps {
  params: Promise<{
    projectId: string;
    folderId: string;
  }>;
}

export default function EmployeeFolderDetailPage({
  params,
}: EmployeeFolderDetailPageProps) {
  const { projectId, folderId } = use(params);

  return (
    <FolderDetailView projectId={projectId} folderId={folderId} isEmployee />
  );
}
