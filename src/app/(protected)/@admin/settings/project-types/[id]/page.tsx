import { notFound } from "next/navigation";
import type { Id } from "@convex/_generated/dataModel";

import ProjectTypeDetail from "@/components/modules/admin/project-types/detail/project-type-detail";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectTypeDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Validate ID format (basic check to avoid obvious bad IDs)
  if (!id || id.length < 10) {
    notFound();
  }

  return <ProjectTypeDetail projectTypeId={id as Id<"projectTypes">} />;
}
