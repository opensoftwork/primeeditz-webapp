"use client";

import { use } from "react";
import { FolderDetailView } from "@/components/modules/projects/detail/folder";

interface FolderPageProps {
  params: Promise<{
    projectId: string;
    folderId: string;
  }>;
}

export default function FolderPage({ params }: FolderPageProps) {
  const { projectId, folderId } = use(params);

  return <FolderDetailView projectId={projectId} folderId={folderId} />;
}
