"use client";

import { QuotationRequestError } from "@/components/modules/studio/quotation-request";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <QuotationRequestError error={error} reset={reset} />;
}
