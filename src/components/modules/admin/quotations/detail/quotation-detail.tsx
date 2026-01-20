"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { SendQuotationDrawer } from "../send";
import {
  ArrowLeft,
  FileText,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailHeader } from "./components/detail-header";
import { ClientProjectInfo } from "./components/client-project-info";
import { LineItemsSection } from "./components/line-items-section";
import { PricingSummary } from "./components/pricing-summary";
import { TermsConditions } from "./components/terms-conditions";
import { QuickActions } from "./components/quick-actions";
import { ClientFeedbackSection } from "./components/client-feedback-section";

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
    color: "text-zinc-400",
    bgColor: "bg-zinc-400/10",
    borderColor: "border-zinc-400/20",
  },
  sent: {
    label: "Sent",
    icon: ArrowRight,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
  },
  viewed: {
    label: "Viewed",
    icon: ShieldCheck,
    color: "text-indigo-400",
    bgColor: "bg-indigo-400/10",
    borderColor: "border-indigo-400/20",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
  },
  changes_requested: {
    label: "Revisions",
    icon: Clock,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
  },
  rejected: {
    label: "Declined",
    icon: AlertCircle,
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/20",
  },
  expired: {
    label: "Expired",
    icon: AlertCircle,
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/20",
  },
  superseded: {
    label: "Superseded",
    icon: FileText,
    color: "text-zinc-500",
    bgColor: "bg-zinc-500/10",
    borderColor: "border-zinc-500/20",
  },
};

export function QuotationDetail({
  quotationId: propQuotationId,
}: {
  quotationId?: string;
}) {
  const params = useParams();
  const router = useRouter();
  const quotationId = propQuotationId || (params.id as string);

  const data = useQuery(
    api.functions.quotations.queries.getQuotationWithSections,
    {
      quotationId: quotationId as Id<"quotations">,
    },
  );

  const [isSendDrawerOpen, setIsSendDrawerOpen] = useState(false);
  const duplicateMutation = useMutation(
    api.functions.quotations.mutations.duplicateQuotation
  );

  if (data === undefined) {
    return <QuotationDetailSkeleton />;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (data === null) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <h2 className="text-xl font-bold text-white">Quotation not found</h2>
        <p className="text-zinc-400">
          The quotation you are looking for does not exist or has been deleted.
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
  const status = statusConfig[quotation.status] || statusConfig.draft;

  // Calculate totals
  const subtotal = quotation.lineItems.reduce((acc: number, item: any) => {
    const itemTotal = item.rate * item.quantity;
    const subItemsTotal =
      item.subItems?.reduce(
        (s: number, sub: any) => s + sub.rate * sub.quantity,
        0,
      ) ?? 0;
    return acc + itemTotal + subItemsTotal;
  }, 0);

  const discountAmount = quotation.discountAmount || 0;
  const taxRate = quotation.taxRate || 0;
  const taxAmount = (subtotal - discountAmount) * taxRate;
  const grandTotal = subtotal - discountAmount + taxAmount;

  // Group line items by project, then by section (new project-based grouping)
  const groupedByProject = projects.map((project: any) => {
    const projectItems = quotation.lineItems.filter(
      (item: any) => item.projectId === project._id
    );
    const sectionGroups = sections
      .map((section: any) => ({
        section,
        items: projectItems.filter(
          (item: any) => item.sectionId === section._id
        ),
      }))
      .filter((g: any) => g.items.length > 0);
    return {
      project,
      sectionGroups,
    };
  }).filter((pg: any) => pg.sectionGroups.length > 0);

  // Fallback: group by section only (for backward compatibility)
  const groupedBySection = sections.map((section: any) => ({
    section,
    items: quotation.lineItems.filter(
      (item: any) => item.sectionId === section._id,
    ),
  }));


  const handleDuplicate = async () => {
    try {
      const toastId = toast.loading("Duplicating quotation...");
      const user = "Divya"; // This should ideally be from auth, but using the name from UI
      const newId = await duplicateMutation({
        quotationId: quotationId as Id<"quotations">,
        createdBy: user,
      });
      toast.success("Quotation duplicated successfully!", { id: toastId });
      router.push(`/quotations/${newId}`);
    } catch (error) {
      toast.error("Failed to duplicate quotation");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 w-full">
      <DetailHeader
        quotation={quotation}
        sections={sections}
        projects={projects}
        status={status}
        quotationId={quotationId}
        onSend={() => setIsSendDrawerOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ClientProjectInfo quotation={quotation} />
          <LineItemsSection
            groupedByProject={groupedByProject}
            groupedBySection={groupedBySection}
            projects={projects}
            formatCurrency={formatCurrency}
          />
          <TermsConditions terms={quotation.terms} />
        </div>

        <div className="space-y-6">
          <ClientFeedbackSection quotation={quotation} />
          <PricingSummary
            subtotal={subtotal}
            discountAmount={discountAmount}
            taxRate={taxRate}
            taxAmount={taxAmount}
            grandTotal={grandTotal}
            formatCurrency={formatCurrency}
          />
          <QuickActions 
            quotation={quotation}
            sections={sections}
            projects={projects}
            onSend={() => setIsSendDrawerOpen(true)}
            onDuplicate={handleDuplicate}
          />
        </div>
      </div>

      <SendQuotationDrawer
        isOpen={isSendDrawerOpen}
        onClose={() => setIsSendDrawerOpen(false)}
        quotation={{
          _id: quotationId as Id<"quotations">,
          code: quotation.code,
          total: quotation.total,
          clientId: quotation.clientId,
          clientName: quotation.clientName,
          status: quotation.status,
          shareToken: quotation.shareToken,
        }}
      />
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
