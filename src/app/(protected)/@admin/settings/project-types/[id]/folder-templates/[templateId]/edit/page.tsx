import { FolderTemplateBuilder } from "@/components/modules/admin/folder-templates/builder/folder-template-builder";
import type { Id } from "@convex/_generated/dataModel";

interface PageProps {
  params: Promise<{
    id: string;
    templateId: string;
  }>;
}

export default async function EditFolderTemplatePage({ params }: PageProps) {
  const { id, templateId } = await params;
  return (
    <FolderTemplateBuilder
      projectTypeId={id as Id<"projectTypes">}
      templateId={templateId as Id<"folderTemplates">}
    />
  );
}
