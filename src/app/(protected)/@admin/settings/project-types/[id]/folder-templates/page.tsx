import { FolderTemplatesList } from "@/components/modules/admin/project-types/folder-templates";
import type { Id } from "@convex/_generated/dataModel";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FolderTemplatesPage({ params }: PageProps) {
  const { id } = await params;
  return <FolderTemplatesList projectTypeId={id as Id<"projectTypes">} />;
}
