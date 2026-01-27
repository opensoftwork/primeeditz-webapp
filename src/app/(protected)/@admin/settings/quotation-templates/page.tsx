import type { Metadata } from "next";
import { TemplateList } from "@/components/modules/admin/quotation-templates";

export const metadata: Metadata = {
  title: "Quotation Templates | PrimeEditz Admin",
  description: "Create and manage reusable quotation templates.",
};

export default function QuotationTemplatesPage() {
  return <TemplateList />;
}
