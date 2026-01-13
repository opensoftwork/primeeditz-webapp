import { TemplateEditor } from "@/components/modules/admin/quotation-templates/template-editor";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Template | PrimeEditz Admin",
  description: "Create a new quotation template.",
};

export default function NewTemplatePage() {
  return <TemplateEditor />;
}
