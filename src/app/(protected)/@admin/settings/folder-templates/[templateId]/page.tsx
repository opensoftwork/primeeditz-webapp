"use client";

import { use } from "react";
import { FolderTemplateBuilder } from "@/components/modules/admin/folder-templates/builder/folder-template-builder";
import type { Id } from "@convex/_generated/dataModel";

interface EditFolderTemplatePageProps {
  params: Promise<{ templateId: string }>;
}

export default function EditFolderTemplatePage({ params }: EditFolderTemplatePageProps) {
  const { templateId } = use(params);
  
  return <FolderTemplateBuilder templateId={templateId as Id<"folderTemplates">} />;
}
