"use client";

import { QuotationDetail } from "@/components/modules/admin/quotations/detail/quotation-detail";
import { useParams } from "next/navigation";

export default function QuotationDetailPage() {
  const params = useParams();
  const quotationId = params.id as string;

  return <QuotationDetail quotationId={quotationId} />;
}
