import { notFound } from "next/navigation";
import type { Id } from "@convex/_generated/dataModel";

import ProjectTypeEditView from "@/components/modules/admin/project-types/edit/project-type-edit-view";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProjectTypePage({ params }: PageProps) {
  const { id } = await params;

  // Validate ID format (basic check to avoid obvious bad IDs)
  if (!id || id.length < 10) {
    notFound();
  }

  return <ProjectTypeEditView projectTypeId={id as Id<"projectTypes">} />;
}
