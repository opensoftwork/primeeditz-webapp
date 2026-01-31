import { FolderTemplateBuilder } from "@/components/modules/admin/folder-templates/builder/folder-template-builder";
import type { Id } from "@convex/_generated/dataModel";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewFolderTemplatePage({ params }: PageProps) {
  const { id } = await params;
  return <FolderTemplateBuilder projectTypeId={id as Id<"projectTypes">} />;
}
