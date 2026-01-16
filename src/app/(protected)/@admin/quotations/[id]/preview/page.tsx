/**
 * Quotation Preview Page
 *
 * Full-page print-ready preview of a quotation.
 */

import { QuotationPreviewClient } from "./client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuotationPreviewPage({ params }: PageProps) {
  const { id } = await params;
  return <QuotationPreviewClient quotationId={id} />;
}
