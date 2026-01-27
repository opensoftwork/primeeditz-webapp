import type { Metadata } from "next";
import { TemplateEditor } from "@/components/modules/admin/quotation-templates/template-editor";

export const metadata: Metadata = {
  title: "New Template | PrimeEditz Admin",
  description: "Create a new quotation template.",
};

export default function NewTemplatePage() {
  return <TemplateEditor />;
}
