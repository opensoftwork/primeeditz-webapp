"use client";

import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, LogIn } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PricingSummary } from "../detail/components/pricing-summary";
import { QuotationDetailHeader } from "../detail/components/quotation-detail-header";
import { QuotationLineItemsView } from "../detail/components/quotation-line-items-view";
import { QuotationTermsView } from "../detail/components/quotation-terms-view";

export function PublicQuotationView() {
  const params = useParams();
  const router = useRouter();
  const shareToken = params.token as string;

  const data = useQuery(
    api.functions.quotations.queries.getQuotationByShareToken,
    {
      shareToken,
    },
  );

  const markViewed = useMutation(
    api.functions.quotations.mutations.markQuotationViewed,
  );

  // Mark as viewed on load
  useEffect(() => {
    if (data?.quotation?.status === "sent") {
      markViewed({ quotationId: data.quotation._id });
    }
  }, [data, markViewed]);

  if (data === undefined) {
    return <PublicQuotationSkeleton />;
  }

  // Handle errors (expired, invalid, etc.)
  if (data === null || "error" in data) {
    const errorMsg =
      data && "error" in data ? (data as any).error : "Quotation not found";
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-6">
        <div className="h-20 w-20 rounded-5xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-red-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
            {errorMsg === "Link expired" ? "Access Expired" : "Access Denied"}
          </h2>
          <p className="text-sm font-bold text-white/30 uppercase tracking-widest max-w-sm">
            {errorMsg === "Link expired"
              ? "This share link has expired. Please contact the studio for a new one."
              : "The quotation you're looking for is either invalid or no longer available."}
          </p>
        </div>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="rounded-2xl h-12 px-8 border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-[10px]"
        >
          Return to Website
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

  // Group by section (public view doesn't have project data)
  const groupedBySection = sections
    .map((section: { _id: string; name: string; color?: string }) => ({
      section,
      items: quotation.lineItems.filter(
        (item: { sectionId?: string }) => item.sectionId === section._id,
      ),
    }))
    .filter((g) => g.items.length > 0);

  // Add unsectioned items
  const unsectionedItems = quotation.lineItems.filter(
    (item: { sectionId?: string }) =>
      !item.sectionId || !sections.some((s) => s._id === item.sectionId),
  );

  if (unsectionedItems.length > 0) {
    groupedBySection.push({
      section: {
        _id: "unsectioned",
        name: "Standard Services",
        color: "zinc",
      } as any,
      items: unsectionedItems,
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-12">
      <QuotationDetailHeader
        quotation={quotation}
        sections={sections}
        onPrint={() => window.print()}
      />

      {/* Response Gate for Public View */}
      {quotation.status === "approved" ? (
        <div className="rounded-4xl bg-green-500/10 border border-green-500/20 p-8 flex items-center gap-6">
          <div className="h-16 w-16 rounded-3xl bg-green-500 flex items-center justify-center shadow-2xl shadow-green-500/20 shrink-0">
            <CheckCircle2 className="h-8 w-8 text-black stroke-[2.5px]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
              Proposal Accepted
            </h3>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
              This quotation was officially confirmed on{" "}
              {format(quotation.approvedAt || Date.now(), "MMMM dd, yyyy")}.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-4xl bg-linear-to-br from-indigo-500/10 to-primary/10 border border-indigo-500/20 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-3xl bg-white flex items-center justify-center shadow-2xl shadow-indigo-500/20 shrink-0">
              <CheckCircle2 className="h-8 w-8 text-black stroke-[2.5px]" />
            </div>
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                Ready to proceed?
              </h3>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                Sign in to your account to accept this proposal and start work.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Button
              asChild
              className="h-14 px-8 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-zinc-100 transition-all hover:scale-105"
            >
              <Link href={`/login?callbackUrl=/quotations/${quotation._id}`}>
                <LogIn className="h-4 w-4 mr-2 stroke-[3px]" />
                Sign in to Accept
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <QuotationLineItemsView
            groupedBySection={groupedBySection}
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

          <div className="rounded-5xl bg-white/2 border border-white/5 p-8 text-center space-y-4">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] leading-relaxed">
              Need assistance or changes?
              <br />
              <span className="text-white/40">
                Email us at studio@primeeditz.com
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PublicQuotationSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 space-y-12">
      <Skeleton className="h-20 w-full rounded-4xl bg-white/5" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-64 rounded-4xl bg-white/5" />
          <Skeleton className="h-48 rounded-4xl bg-white/5" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-48 rounded-4xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}
