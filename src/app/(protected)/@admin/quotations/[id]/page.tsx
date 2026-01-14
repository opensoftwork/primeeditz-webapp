"use client";

import { QuotationBuilder } from "@/components/modules/admin/quotations/builder/quotation-builder";
import { useParams } from "next/navigation";

export default function EditQuotationPage() {
  const params = useParams();
  const quotationId = params.id as string;

  return <QuotationBuilder quotationId={quotationId} />;
}
