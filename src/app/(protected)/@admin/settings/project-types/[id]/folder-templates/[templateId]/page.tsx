import type { Id } from "@convex/_generated/dataModel";
import FolderTemplateDetail from "@/components/modules/admin/folder-templates/detail/folder-template-detail";

interface PageProps {
  params: Promise<{
    id: string;
    templateId: string;
  }>;
}

export default async function FolderTemplateDetailPage({ params }: PageProps) {
  const { id, templateId } = await params;
  return (
    <FolderTemplateDetail
      projectTypeId={id as Id<"projectTypes">}
      templateId={templateId as Id<"folderTemplates">}
    />
  );
}
