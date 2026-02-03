/**
 * Quotation Preview Client Component
 *
 * Fetches quotation data and renders the print-ready preview.
 */

"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ArrowLeft, Loader2, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { QuotationPreview } from "@/components/modules/admin/quotations/preview";
import { Button } from "@/components/ui/button";

interface QuotationPreviewClientProps {
  quotationId: string;
}

export function QuotationPreviewClient({
  quotationId,
}: QuotationPreviewClientProps) {
  const router = useRouter();

  // Fetch quotation with sections
  const data = useQuery(
    api.functions.quotations.queries.getQuotationWithSections,
    { quotationId: quotationId as Id<"quotations"> },
  );

  // Loading state
  if (data === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-zinc-500">
            Loading preview...
          </p>
        </div>
      </div>
    );
  }

  // Not found
  if (data === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-950">
        <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
          <Receipt className="h-8 w-8 text-white/20" />
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">
          Quotation Not Found
        </h2>
        <p className="text-sm text-white/40 mb-6">
          The quotation you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/quotations")}
          className="font-bold"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quotations
        </Button>
      </div>
    );
  }

  const { quotation, sections, projects = [] } = data;

  return (
    <QuotationPreview
      quotation={{
        code: quotation.code,
        version: quotation.version,
        status: quotation.status,
        studioId: quotation.studioId,
        projectIds: quotation.projectIds,
        lineItems: quotation.lineItems,
        terms: quotation.terms,
        validUntil: quotation.validUntil,
        taxRate: quotation.taxRate,
        discountAmount: quotation.discountAmount,
        _creationTime: quotation._creationTime,
      }}
      sections={sections}
      projects={projects}
      onBack={() => router.back()}
    />
  );
}
