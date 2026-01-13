"use client";

import { useParams } from "next/navigation";
import { TemplateEditor } from "@/components/modules/admin/quotation-templates/template-editor";

export default function EditTemplatePage() {
  const params = useParams();
  const templateId = params.id as string;

  return <TemplateEditor templateId={templateId} />;
}
