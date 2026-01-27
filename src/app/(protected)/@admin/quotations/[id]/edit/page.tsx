"use client";

import { useParams } from "next/navigation";
import { EditQuotation } from "@/components/modules/admin/quotations/edit/edit-quotation";

export default function EditQuotationPage() {
  const params = useParams();
  const quotationId = params.id as string;

  return <EditQuotation quotationId={quotationId} />;
}
