"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { SendQuotationDrawer } from "../send";
import {
  DetailHeader,
  LineItemsSection,
  PricingSummary,
  QuickActions,
  QuotationDetailSkeleton,
  ReviewActions,
  SpawnedProjectsList,
  StudioFeedbackSection,
  StudioProjectInfo,
  TermsConditions,
} from "./components";
import { statusConfig } from "./components/constants";
import { useQuotationData } from "./hooks/use-quotation-data";

export function QuotationDetail({
  quotationId: propQuotationId,
}: {
  quotationId?: string;
}) {
  const params = useParams();
  const router = useRouter();
  const quotationId = propQuotationId || (params.id as string);
  const { setOverride, removeOverride } = useBreadcrumbStore();

  const data = useQuery(
    //@ts-ignore
    api.functions.quotations.queries.getQuotationWithSections,
    {
      quotationId: quotationId as Id<"quotations">,
    },
  );

  const quotationData = useQuotationData(data);

  useEffect(() => {
    if (data?.quotation?.code) {
      setOverride(quotationId, data.quotation.code);
    }
    return () => removeOverride(quotationId);
  }, [quotationId, data?.quotation?.code, setOverride, removeOverride]);

  const [isSendDrawerOpen, setIsSendDrawerOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  
  const duplicateMutation = useMutation(
    api.functions.quotations.mutations.duplicateQuotation,
  );
  const approveQuotation = useMutation(
    api.functions.quotations.mutations.approveQuotation,
  );

  if (data === undefined || !quotationData) {
    return <QuotationDetailSkeleton />;
  }

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

  const {
    quotation,
    sections,
    projects,
    subtotal,
    discountAmount,
    taxRate,
    taxAmount,
    grandTotal,
    groupedByProject,
    groupedBySection,
  } = quotationData;

  const status = statusConfig[quotation.status] || statusConfig.draft;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDuplicate = async () => {
    try {
      const toastId = toast.loading("Duplicating quotation...");
      const user = "Divya"; 
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

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const toastId = toast.loading(
        "Approving quotation and creating projects...",
      );
      await approveQuotation({
        quotationId: quotationId as Id<"quotations">,
      });
      toast.success("Quotation approved and projects created!", {
        id: toastId,
      });
    } catch (error) {
      toast.error("Failed to approve quotation");
      console.error(error);
    } finally {
      setIsApproving(false);
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
        onApprove={handleApprove}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <StudioProjectInfo quotation={quotation} />
          <LineItemsSection
            groupedByProject={groupedByProject}
            groupedBySection={groupedBySection}
            projects={projects}
            formatCurrency={formatCurrency}
          />
          {quotation.status === "approved" && (
            <SpawnedProjectsList quotationId={quotationId} />
          )}
          <TermsConditions terms={quotation.terms} />
        </div>

        <div className="space-y-6">
          <ReviewActions quotation={quotation} />
          <StudioFeedbackSection quotation={quotation} />
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
          studioId: quotation.studioId,
          studioName: quotation.studioName,
          status: quotation.status,
          shareToken: quotation.shareToken,
        }}
      />
    </div>
  );
}
