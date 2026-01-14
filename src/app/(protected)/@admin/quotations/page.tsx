import { QuotationList } from "@/components/modules/admin/quotations/quotation-list";

export const metadata = {
  title: "Quotations | Admin Portal",
  description: "Manage professional estimates and client pricing proposals.",
};

export default function AdminQuotationsPage() {
  return <QuotationList />;
}
