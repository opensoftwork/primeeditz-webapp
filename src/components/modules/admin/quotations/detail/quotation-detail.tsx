/**
 * Quotation Detail View
 *
 * Read-only detail view for a quotation with all line items,
 * pricing summary, and action buttons.
 */

"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Receipt, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Sub-components
import {
  DetailHeader,
  ClientProjectInfo,
  LineItemsSection,
  PricingSummary,
  TermsConditions,
  QuickActions,
} from "./components";

// Icons for status config
import {
  FileText,
  Send,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

// ============================================================================
// Status Config
// ============================================================================

const statusConfig: Record<
  string,
  {
    label: string;
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  draft: {
    label: "Draft",
    icon: FileText,
    color: "text-white/60",
    bgColor: "bg-white/5",
    borderColor: "border-white/10",
  },
  sent: {
    label: "Sent",
    icon: Send,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
  },
  viewed: {
    label: "Viewed",
    icon: ExternalLink,
    color: "text-indigo-400",
    bgColor: "bg-indigo-400/10",
    borderColor: "border-indigo-400/20",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/20",
  },
  changes_requested: {
    label: "Revisions Requested",
    icon: Clock,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/20",
  },
  rejected: {
    label: "Rejected",
    icon: AlertCircle,
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/20",
  },
  expired: {
    label: "Expired",
    icon: AlertCircle,
    color: "text-zinc-500",
    bgColor: "bg-zinc-500/10",
    borderColor: "border-zinc-500/20",
  },
};

// ============================================================================
// Currency Formatter
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// ============================================================================
// Main Component
// ============================================================================

interface QuotationDetailProps {
  quotationId: string;
}

export function QuotationDetail({ quotationId }: QuotationDetailProps) {
  const router = useRouter();

  // Fetch quotation with enriched data (including sections)
  const data = useQuery(
    api.functions.quotations.queries.getQuotationWithSections,
    { quotationId: quotationId as Id<"quotations"> }
  );

  // Loading state
  if (data === undefined) {
    return <QuotationDetailSkeleton />;
  }

  // Not found
  if (data === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
          <Receipt className="h-8 w-8 text-white/20" />
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">
          Quotation Not Found
        </h2>
        <p className="text-sm text-white/40 mb-6">
          The quotation you&apos;re looking for doesn&apos;t exist or has been
          removed.
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

  const { quotation, sections } = data;
  const status = statusConfig[quotation.status] || statusConfig.draft;

  // Calculate totals
  const subtotal = quotation.lineItems.reduce((acc: number, item: any) => {
    const itemTotal = item.rate * item.quantity;
    const subItemsTotal =
      item.subItems?.reduce(
        (s: number, sub: any) => s + sub.rate * sub.quantity,
        0
      ) ?? 0;
    return acc + itemTotal + subItemsTotal;
  }, 0);

  const discountAmount = quotation.discountAmount || 0;
  const taxRate = quotation.taxRate || 0;
  const taxAmount = (subtotal - discountAmount) * taxRate;
  const grandTotal = subtotal - discountAmount + taxAmount;

  // Group line items by section
  const groupedItems = sections.map((section: any) => ({
    section,
    items: quotation.lineItems.filter(
      (item: any) => item.sectionId === section._id
    ),
  }));

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 w-full">
      <DetailHeader
        quotation={quotation}
        status={status}
        quotationId={quotationId}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ClientProjectInfo quotation={quotation} />
          <LineItemsSection
            groupedItems={groupedItems}
            formatCurrency={formatCurrency}
          />
          <TermsConditions terms={quotation.terms} />
        </div>

        <div className="space-y-6">
          <PricingSummary
            subtotal={subtotal}
            discountAmount={discountAmount}
            taxRate={taxRate}
            taxAmount={taxAmount}
            grandTotal={grandTotal}
            formatCurrency={formatCurrency}
          />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Skeleton Loader
// ============================================================================

function QuotationDetailSkeleton() {
  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 w-full">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton className="h-5 w-32 bg-white/5" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl bg-white/5" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 bg-white/5" />
              <Skeleton className="h-4 w-32 bg-white/5" />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-xl bg-white/5" />
          <Skeleton className="h-10 w-24 rounded-xl bg-white/5" />
          <Skeleton className="h-10 w-32 rounded-xl bg-white/5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-32 rounded-2xl bg-white/5" />
          <Skeleton className="h-64 rounded-2xl bg-white/5" />
          <Skeleton className="h-48 rounded-2xl bg-white/5" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-2xl bg-white/5" />
          <Skeleton className="h-40 rounded-2xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}
