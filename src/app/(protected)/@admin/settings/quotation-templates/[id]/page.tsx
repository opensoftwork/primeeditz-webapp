"use client";

import { useParams } from "next/navigation";
import { TemplateDetail } from "@/components/modules/admin/quotation-templates/template-detail";

export default function ViewTemplatePage() {
  const params = useParams();
  const templateId = params.id as string;

  return <TemplateDetail templateId={templateId} />;
}
