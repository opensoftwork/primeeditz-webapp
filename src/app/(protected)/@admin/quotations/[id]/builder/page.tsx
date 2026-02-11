"use client";

import { useParams, useSearchParams } from "next/navigation";
import { QuotationBuilder } from "@/components/modules/admin/quotations/builder/quotation-builder";

export default function QuotationBuilderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const quotationId = params.id as string;

  // Get initial step from query params, default to 1
  const stepParam = searchParams.get("step");
  const initialStep = stepParam
    ? (parseInt(stepParam, 10) as 1 | 2 | 3 | 4)
    : 1;

  return (
    <QuotationBuilder quotationId={quotationId} initialStep={initialStep} />
  );
}
