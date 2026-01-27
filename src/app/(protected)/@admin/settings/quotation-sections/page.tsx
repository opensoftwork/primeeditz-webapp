import type { Metadata } from "next";
import { SectionList } from "@/components/modules/admin/quotation-sections";

export const metadata: Metadata = {
  title: "Quotation Sections | PrimeEditz Admin",
  description: "Manage quotation sections for project estimates.",
};

export default function QuotationSectionsPage() {
  return <SectionList />;
}
