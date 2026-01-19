"use client";

import { use } from "react";
import { FolderDetailView } from "@/components/modules/projects/detail/folder";

interface AdminFolderPageProps {
  params: Promise<{
    projectId: string;
    folderId: string;
  }>;
}

export default function AdminFolderPage({ params }: AdminFolderPageProps) {
  const { projectId, folderId } = use(params);

  return <FolderDetailView projectId={projectId} folderId={folderId} isAdmin />;
}
