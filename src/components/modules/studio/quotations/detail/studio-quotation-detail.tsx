"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { SpawnedProjectsList } from "@/components/modules/admin/quotations/detail/components";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import {
  PricingSummary,
  QuotationActionButtons,
  QuotationDetailHeader,
  QuotationLineItemsView,
  QuotationTermsView,
} from "..";

export function StudioQuotationDetail() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params.id as string;
  //@ts-ignore
  const data = useQuery(api.functions.quotations.queries.getMyQuotationDetail, {
    quotationId: quotationId as Id<"quotations">,
  });

  const markViewed = useMutation(
    api.functions.quotations.mutations.markQuotationViewed,
  );
  const reinitiate = useMutation(
    api.functions.quotations.mutations.reinitiateQuotation,
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
    return <StudioQuotationSkeleton />;
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

  const { quotation, sections, projects = [] } = data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Group line items by project, then by section (new project-based grouping)
  const groupedByProject = projects
    .map(
      (project: {
        _id: string;
        code: string;
        eventName?: string;
        projectTypeName?: string;
      }) => {
        const projectItems = quotation.lineItems.filter(
          (item: { projectId?: string }) => item.projectId === project._id,
        );

        // 1. Group by existing sections
        const sectionGroups = sections
          .map((section: { _id: string; name: string; color?: string }) => ({
            section,
            items: projectItems.filter(
              (item: { sectionId?: string }) => item.sectionId === section._id,
            ),
          }))
          .filter((g) => g.items.length > 0);

        // 2. Catch items without sections (or with invalid sections)
        const unsectionedItems = projectItems.filter(
          (item: { sectionId?: string }) =>
            !item.sectionId || !sections.some((s) => s._id === item.sectionId),
        );

        if (unsectionedItems.length > 0) {
          sectionGroups.push({
            section: {
              _id: "unsectioned",
              name: "Standard Services",
              color: "zinc",
            } as any,
            items: unsectionedItems,
          });
        }

        return {
          project,
          sectionGroups,
          eventName: project.eventName,
          projectCode: project.code,
        };
      },
    )
    .filter((pg) => pg.sectionGroups.length > 0);

  // Fallback: group by section only (for backward compatibility)
  const groupedBySection = sections
    .map((section: { _id: string; name: string; color?: string }) => ({
      section,
      items: quotation.lineItems.filter(
        (item: { sectionId?: string }) => item.sectionId === section._id,
      ),
    }))
    .filter((g) => g.items.length > 0);

  // Add unsectioned items to global fallback if not empty
  const globalUnsectioned = quotation.lineItems.filter(
    (item: { sectionId?: string }) =>
      !item.sectionId || !sections.some((s) => s._id === item.sectionId),
  );

  if (globalUnsectioned.length > 0) {
    groupedBySection.push({
      section: {
        _id: "unsectioned",
        name: "Standard Services",
        color: "zinc",
      } as any,
      items: globalUnsectioned,
    });
  }

  return (
    <div className="min-h-screen p-6 md:p-12 space-y-12 w-full">
      <QuotationDetailHeader
        quotation={quotation}
        sections={sections}
        onPrint={() => window.print()}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {quotation.status === "rejected" && (
            <div className="p-8 rounded-4xl bg-red-400/5 border border-red-400/10 space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="h-6 w-6" />
                <h3 className="text-lg font-black uppercase tracking-tight">
                  Request Declined
                </h3>
              </div>
              <p className="text-sm font-bold text-white/60 leading-relaxed italic">
                "{quotation.rejectionReason || "No specific reason provided."}"
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 pt-2">
                Please contact the admin or re-initiate the request with
                necessary changes.
              </p>
              <div className="pt-2">
                <Button
                  onClick={async () => {
                    const toastId = toast.loading("Re-initiating request...");
                    try {
                      await reinitiate({ quotationId: quotation._id });
                      toast.success("Request re-initiated!", { id: toastId });
                    } catch (err) {
                      toast.error("Failed to re-initiate request");
                    }
                  }}
                  className="bg-white text-black font-black uppercase tracking-widest text-[10px] px-6 h-10 rounded-xl hover:scale-105 transition-all"
                >
                  Edit & Re-submit
                </Button>
              </div>
            </div>
          )}
          <QuotationLineItemsView
            groupedByProject={groupedByProject}
            groupedBySection={groupedBySection}
            projects={projects}
            formatCurrency={formatCurrency}
          />
          {quotation.status === "approved" && (
            <SpawnedProjectsList quotationId={quotationId} />
          )}
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

function StudioQuotationSkeleton() {
  return (
    <div className="min-h-screen p-8 md:p-12 space-y-12 w-full">
      <Skeleton className="h-20 w-full rounded-3xl bg-white/5" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-64 rounded-3xl bg-white/5" />
          <Skeleton className="h-48 rounded-3xl bg-white/5" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-48 rounded-3xl bg-white/5" />
          <Skeleton className="h-64 rounded-3xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}
