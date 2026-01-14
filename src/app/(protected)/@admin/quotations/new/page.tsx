import { QuotationBuilder } from "@/components/modules/admin/quotations/builder/quotation-builder";

export const metadata = {
  title: "New Quotation | Admin Portal",
  description: "Create a new professional pricing proposal.",
};

export default function NewQuotationPage() {
  return <QuotationBuilder />;
}
