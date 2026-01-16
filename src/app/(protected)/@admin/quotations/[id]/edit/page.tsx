"use client";

import { EditQuotation } from "@/components/modules/admin/quotations/edit/edit-quotation";
import { useParams } from "next/navigation";

export default function EditQuotationPage() {
  const params = useParams();
  const quotationId = params.id as string;

  return <EditQuotation quotationId={quotationId} />;
}
