"use client";

import { QuotationRequestError } from "@/components/modules/studio/quotations/request-flow/steps/shared/quotation-request-error";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <QuotationRequestError error={error} reset={reset} />;
}
