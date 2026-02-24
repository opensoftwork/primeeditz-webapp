"use client";

import { useEffect, useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBuilder } from "../../builder-context";
import { IdentitySummary } from "./identity-summary";
import { ConfigSummary } from "./config-summary";
import { PricingSummary } from "./pricing-summary";
import { TermsSummary } from "./terms-summary";
import { TotalsCard } from "./totals-card";

export function Step5Review() {
  const router = useRouter();
  const {
    step1Data,
    step2Data,
    step3Data,
    setCurrentStep,
    setSubmitTrigger,
    isEditing,
    packageId,
    publishPackage,
  } = useBuilder();

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(() => () => handleSave(true));
    return () => setSubmitTrigger(null);
  }, [setSubmitTrigger]);

  // Queries
  const projectTypes = useQuery(api.functions.projectTypes.queries.list) || [];
  const categories =
    useQuery(api.functions.projectCategories.queries.getProjectCategories) ||
    [];
  const storageTiers =
    useQuery(api.functions.storageTiers.queries.listStorageTiers) || [];

  // Mutations
  const updatePackage = useMutation(
    api.functions.servicePackages.mutations.update,
  );

  const [isSaving, setIsSaving] = useState(false);

  // Totals Calculation
  const lineItems = step3Data?.lineItems ?? [];

  const calculateItemTotal = (item: any): number => {
    const self = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
    const subTotal = (item.subItems || []).reduce((sum: number, sub: any) => {
      const subSelf = (Number(sub.rate) || 0) * (Number(sub.quantity) || 0);
      const subSubTotal = (sub.subItems || []).reduce(
        (s: number, ss: any) =>
          s + (Number(ss.rate) || 0) * (Number(ss.quantity) || 0),
        0,
      );
      return sum + subSelf + subSubTotal;
    }, 0);
    return self + subTotal;
  };

  const subtotal = lineItems.reduce(
    (sum, item) => sum + calculateItemTotal(item),
    0,
  );

  const gstPercentage = step3Data?.gstPercentage ?? 18;
  const gstAmount = step3Data?.applyGST
    ? Math.round(subtotal * (gstPercentage / 100))
    : 0;
  const total = subtotal + gstAmount;

  async function handleSave(isActive: boolean) {
    if (!step1Data || !step2Data || !step3Data) {
      toast.error("Missing configuration data. Please complete all steps.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading(
      isEditing ? "Updating package..." : "Publishing package...",
    );

    try {
      if (isEditing && packageId) {
        const packageData = {
          name: step1Data.name,
          description: step1Data.description,
          categoryId:
            (step2Data.projectConfigs[0]
              ?.categoryId as Id<"projectCategories">) || undefined,
          projectConfigs: step2Data.projectConfigs.map((config) => ({
            id: config.id,
            label: config.label,
            categoryId: (config.categoryId &&
            (config.categoryId as string) !== ""
              ? config.categoryId
              : undefined) as Id<"projectCategories">,
            projectTypeId: config.projectTypeId as Id<"projectTypes">,
            folderTemplateId: config.folderTemplateId as Id<"folderTemplates">,
            defaultStorageTierId: (config.defaultStorageTierId &&
            (config.defaultStorageTierId as string) !== ""
              ? config.defaultStorageTierId
              : undefined) as Id<"storageTiers">,
          })),
          // Legacy fields
          projectTypeId: step2Data.projectConfigs[0]?.projectTypeId,
          folderTemplateId: step2Data.projectConfigs[0]?.folderTemplateId,
          defaultStorageTierId:
            step2Data.projectConfigs[0]?.defaultStorageTierId,

          lineItems: step3Data.lineItems.map((item) => ({
            id: item.id,
            sectionId: (item.sectionId && (item.sectionId as string) !== ""
              ? (item.sectionId as Id<"quotationSections">)
              : undefined) as Id<"quotationSections">,
            projectConfigId: item.projectConfigId,
            description: item.description,
            unit: item.unit,
            rate: Number(item.rate) || 0,
            quantity: Number(item.quantity) || 1,
            subItems: item.subItems,
          })),
          terms: step3Data.terms,
          applyGST: step3Data.applyGST,
          gstPercentage: step3Data.gstPercentage,
          isActive,
        };
        await updatePackage({ id: packageId, ...packageData });
        toast.success(`Package "${step1Data.name}" updated successfully`, {
          id: toastId,
        });
        router.push("/settings/service-packages");
      } else {
        // Creation Flow using Draft Persistence
        const newPackageId = await publishPackage();
        if (newPackageId) {
          toast.success(`Package "${step1Data.name}" published successfully`, {
            id: toastId,
          });
          router.push("/settings/service-packages");
        }
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(
        error.message ||
          "Failed to save package. Check your values and try again.",
        {
          id: toastId,
        },
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-8 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">
            Final Inspection
          </span>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
          Package Review
        </h2>
        <p className="text-xs font-semibold text-white/40 max-w-lg leading-relaxed">
          Verify all configurations, line items, and terms before finalizing the
          service package.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Summary Details */}
        <div className="lg:col-span-8 space-y-12">
          <IdentitySummary />
          <ConfigSummary
            projectTypes={projectTypes}
            categories={categories}
            storageTiers={storageTiers}
          />
          <PricingSummary lineItems={lineItems} />
          <TermsSummary />
        </div>

        {/* Right Column: Final CTA & Totals */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit space-y-6">
          <TotalsCard
            total={total}
            subtotal={subtotal}
            gstAmount={gstAmount}
            gstPercentage={gstPercentage}
          />
        </div>
      </div>
    </div>
  );
}
