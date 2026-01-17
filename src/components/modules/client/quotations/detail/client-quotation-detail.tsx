"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  QuotationDetailHeader,
  QuotationLineItemsView,
  QuotationTermsView,
  QuotationActionButtons,
  PricingSummary,
} from "@/components/modules/client/quotations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";

export function ClientQuotationDetail() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params.id as string;

  const data = useQuery(api.functions.quotations.queries.getMyQuotationDetail, {
    quotationId: quotationId as Id<"quotations">,
  });

  const markViewed = useMutation(
    api.functions.quotations.mutations.markQuotationViewed,
  );

  const { setOverride, removeOverride } = useBreadcrumbStore();

  // Mark as viewed and set breadcrumbs on load
  useEffect(() => {
    if (data?.quotation?.status === "sent") {
      markViewed({ quotationId: quotationId as Id<"quotations"> });
    }

    if (data?.quotation?.code) {
      setOverride(quotationId, data.quotation.code);
    }

    return () => {
      removeOverride(quotationId);
    };
  }, [data, quotationId, markViewed, setOverride, removeOverride]);

  if (data === undefined) {
    return <ClientQuotationSkeleton />;
  }

  if (data === null) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
            Quotation Not Found
          </h2>
          <p className="text-sm font-bold text-white/30 uppercase tracking-widest">
            The quotation you're looking for doesn't exist or has been removed.
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard")}
          variant="outline"
          className="rounded-2xl h-12 px-8 border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-[10px]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const { quotation, sections } = data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const groupedItems = sections.map((section: any) => ({
    section,
    items: quotation.lineItems.filter(
      (item: any) => item.sectionId === section._id,
    ),
  }));

  return (
    <div className="min-h-screen p-6 md:p-12 space-y-12 w-full max-w-7xl mx-auto">
      <QuotationDetailHeader
        quotation={quotation as any}
        onPrint={() => window.print()}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <QuotationLineItemsView
            groupedItems={groupedItems}
            formatCurrency={formatCurrency}
          />
          <QuotationTermsView terms={quotation.terms} />
        </div>

        <div className="space-y-8">
          <PricingSummary
            subtotal={quotation.subtotal}
            taxAmount={quotation.taxAmount}
            discountAmount={quotation.discountAmount || 0}
            total={quotation.total}
            formatCurrency={formatCurrency}
          />

          <QuotationActionButtons
            status={quotation.status}
            quotation={quotation as any}
            className="md:grid-cols-1"
          />
        </div>
      </div>
    </div>
  );
}

function ClientQuotationSkeleton() {
  return (
    <div className="min-h-screen p-8 md:p-12 space-y-12 max-w-7xl mx-auto">
      <Skeleton className="h-20 w-full rounded-[2rem] bg-white/5" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-64 rounded-[2rem] bg-white/5" />
          <Skeleton className="h-48 rounded-[2rem] bg-white/5" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-48 rounded-[2rem] bg-white/5" />
          <Skeleton className="h-64 rounded-[2rem] bg-white/5" />
        </div>
      </div>
    </div>
  );
}
