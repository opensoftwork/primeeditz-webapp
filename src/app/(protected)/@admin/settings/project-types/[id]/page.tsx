import { notFound } from "next/navigation";
import ProjectTypeWizard from "@/components/modules/admin/project-types/wizard";
import type { Id } from "@convex/_generated/dataModel";

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

  return <ProjectTypeWizard projectTypeId={id as Id<"projectTypes">} />;
}
