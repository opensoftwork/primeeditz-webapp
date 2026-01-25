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
} from "..";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { SpawnedProjectsList } from "@/components/modules/quotations/detail/spawned-projects-list";

export function StudioQuotationDetail() {
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
        const sectionGroups = sections
          .map((section: { _id: string; name: string; color?: string }) => ({
            section,
            items: projectItems.filter(
              (item: { sectionId?: string }) => item.sectionId === section._id,
            ),
          }))
          .filter((g) => g.items.length > 0);
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
  const groupedBySection = sections.map(
    (section: { _id: string; name: string; color?: string }) => ({
      section,
      items: quotation.lineItems.filter(
        (item: { sectionId?: string }) => item.sectionId === section._id,
      ),
    }),
  );

  return (
    <div className="min-h-screen p-6 md:p-12 space-y-12 w-full">
      <QuotationDetailHeader
        quotation={quotation}
        sections={sections}
        onPrint={() => window.print()}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <QuotationLineItemsView
            groupedByProject={groupedByProject}
            groupedBySection={groupedBySection}
            projects={projects}
            formatCurrency={formatCurrency}
          />
          {quotation.status === "approved" && (
            <SpawnedProjectsList quotationId={quotationId} isAdmin={false} />
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
