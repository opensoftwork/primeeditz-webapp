"use client";

import { use } from "react";
import { FolderListingView } from "@/components/modules/projects/folders/folder-listing-view";

interface AdminProjectFoldersPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function AdminProjectFoldersPage({
  params,
}: AdminProjectFoldersPageProps) {
  const { projectId } = use(params);

  return (
    <div className="p-8 md:p-12">
      <FolderListingView projectId={projectId} isAdmin />
    </div>
  );
}
