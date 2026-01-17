import { ClientQuotationList } from "@/components/modules/client/quotations";

export const metadata = {
  title: "My Quotations | Client Portal",
  description: "Review and approve your project proposals.",
};

export default function QuotationsPage() {
  return <ClientQuotationList />;
}
