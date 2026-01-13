import { TemplateList } from "@/components/modules/admin/quotation-templates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quotation Templates | PrimeEditz Admin",
  description: "Create and manage reusable quotation templates.",
};

export default function QuotationTemplatesPage() {
  return <TemplateList />;
}
