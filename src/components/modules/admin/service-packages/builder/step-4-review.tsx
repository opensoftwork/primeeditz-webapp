"use client";

import { useEffect, useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  BadgeAlert,
  Check,
  CreditCard,
  Eye,
  FileText,
  HardDrive,
  Layers,
  Pencil,
  Rocket,
  Save,
  Package,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useBuilder } from "./builder-context";
import { FolderPreview } from "./components/folder-preview";
export function Step4Review() {
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
    isSubmitting,
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
  const createPackage = useMutation(
    api.functions.servicePackages.mutations.create,
  );
  const updatePackage = useMutation(
    api.functions.servicePackages.mutations.update,
  );

  const [isSaving, setIsSaving] = useState(false);

  // Totals Calculation
  const lineItems = step3Data?.lineItems ?? [];
  const subtotal = lineItems.reduce(
    (sum, item) => sum + (item.rate || 0) * (item.quantity || 1),
    0,
  );
  const gstAmount = step3Data?.applyGST ? Math.round(subtotal * 0.18) : 0;
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
          categoryId: (step1Data.categoryId as Id<"projectCategories">) || undefined,
          projectConfigs: step2Data.projectConfigs.map((config) => ({
            id: config.id,
            label: config.label,
            projectTypeId: config.projectTypeId,
            folderTemplateId: config.folderTemplateId,
            defaultStorageTierId: config.defaultStorageTierId,
          })),
          // Legacy fields
          projectTypeId: step2Data.projectConfigs[0].projectTypeId,
          folderTemplateId: step2Data.projectConfigs[0].folderTemplateId,
          defaultStorageTierId: step2Data.projectConfigs[0].defaultStorageTierId,
          
          lineItems: step3Data.lineItems.map((item) => ({
            id: item.id,
            sectionId: item.sectionId,
            description: item.description,
            unit: item.unit,
            rate: item.rate,
            quantity: item.quantity,
          })),
          terms: step3Data.terms,
          applyGST: step3Data.applyGST,
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
          toast.success(`Package "${step1Data.name}" published successfully`, { id: toastId });
          router.push("/settings/service-packages");
        }
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save package. Check your values and try again.", {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
    }
  }

  const categoryName = categories.find(
    (c) => c._id === step1Data?.categoryId,
  )?.name;

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
        <div className="lg:col-span-8 space-y-8">
          {/* Section: Identity */}
          <div className="group space-y-4">
            <div className="flex items-center justify-between ml-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                  Identity Summary
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(1)}
                className="h-8 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest gap-1.5"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
            </div>

            <Card className="bg-zinc-900/40 border-white/5 rounded-[32px] overflow-hidden glass-subtle">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                    Package Title
                  </p>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight">
                    {step1Data?.name}
                  </h4>
                </div>

                {step1Data?.description && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                      Public Description
                    </p>
                    <p className="text-sm text-white/50 leading-relaxed max-w-2xl">
                      {step1Data.description}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                      Category:{" "}
                      <span className="text-white">
                        {categoryName || "None"}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                    <Package className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                      Spawn Count:{" "}
                      <span className="text-white">
                        {step2Data?.projectConfigs.length || 0} Projects
                      </span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section: Configurations Summary */}
          <div className="group space-y-4">
            <div className="flex items-center justify-between ml-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <HardDrive className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                  Project Config Summary
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(2)}
                className="h-8 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest gap-1.5"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
            </div>

            <div className="space-y-4">
              {step2Data?.projectConfigs.map((config, index) => {
                const type = projectTypes.find(
                  (t) => t._id === config.projectTypeId,
                );
                const tier = storageTiers.find(
                  (t) => t._id === config.defaultStorageTierId,
                );

                return (
                  <Card
                    key={config.id}
                    className="bg-zinc-900/40 border-white/5 rounded-[32px] overflow-hidden glass-subtle"
                  >
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                        <div className="md:col-span-4 space-y-4">
                          <div>
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                              Configuration {index + 1}
                            </p>
                            <h4 className="text-lg font-black text-white uppercase tracking-tight mt-1">
                              {config.label || "Untitled Project"}
                            </h4>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">
                                {type?.name || "Unknown Type"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <HardDrive className="h-3.5 w-3.5 text-white/20" />
                              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                                {tier
                                  ? `${tier.name} (${tier.sizeGB}GB)`
                                  : "On-Demand Storage"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-8 bg-zinc-950/20 rounded-2xl overflow-hidden border border-white/5 relative group/preview">
                          <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                          <div className="p-6 flex flex-col items-center justify-center text-center space-y-3 relative z-10">
                            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover/preview:scale-110 transition-transform duration-300">
                              <Layers className="h-6 w-6 text-primary/40 group-hover/preview:text-primary transition-colors" />
                            </div>
                            <div className="space-y-1">
                              <h5 className="text-sm font-bold text-white uppercase tracking-tight">
                                Folder Structure
                              </h5>
                              <p className="text-[10px] text-white/40 font-medium max-w-[200px]">
                                Click to view the complete folder hierarchy for this project config
                              </p>
                            </div>
                            
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-8 text-[10px] uppercase font-black tracking-widest bg-white/5 border-white/10 hover:bg-white/10 hover:text-white mt-1"
                                >
                                  View Structure
                                </Button>
                              </SheetTrigger>
                              <SheetContent className="w-full sm:max-w-xl bg-zinc-950 border-l border-white/10 p-0">
                                <SheetHeader className="p-6 border-b border-white/10">
                                  <SheetTitle className="text-lg font-black uppercase tracking-tight text-white">
                                    Folder Structure Preview
                                  </SheetTitle>
                                  <SheetDescription className="text-xs text-white/40 font-medium uppercase tracking-wider">
                                    {config.label || "Project Configuration"}
                                  </SheetDescription>
                                </SheetHeader>
                                <div className="h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
                                  <FolderPreview templateId={config.folderTemplateId} />
                                </div>
                              </SheetContent>
                            </Sheet>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Section: Pricing */}
          <div className="group space-y-4">
            <div className="flex items-center justify-between ml-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                  Pricing & Terms Summary
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(3)}
                className="h-8 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest gap-1.5"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
            </div>

            <Card className="bg-zinc-900/40 border-white/5 rounded-[32px] overflow-hidden glass-subtle">
              <CardContent className="p-0">
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                      Package Line Items
                    </p>
                    <div className="space-y-3">
                      {lineItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 border-b border-white/5"
                        >
                          <div>
                            <p className="text-xs font-black text-white uppercase tracking-tight">
                              {item.description}
                            </p>
                            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">
                              {item.quantity} × {item.unit}
                            </p>
                          </div>
                          <span className="font-black text-white tracking-widest text-sm">
                            ₹{(item.rate * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {step3Data?.terms && (
                    <div className="pt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-white/20" />
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                          Terms of Service
                        </p>
                      </div>
                      <p className="text-[11px] text-white/40 leading-relaxed italic">
                        {step3Data.terms}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Final CTA & Totals */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit space-y-6">
          <Card className="bg-primary border-primary/20 rounded-[40px] overflow-hidden shadow-2xl shadow-primary/20">
            <div className="p-8 space-y-8 bg-zinc-950/20 backdrop-blur-xl">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  Total Package Value
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-white tracking-tighter italic">
                    ₹{total.toLocaleString()}
                  </span>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">
                    / Start
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                  <span>Base Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1 w-1 rounded-full bg-white/40" />
                    <span className="opacity-40">GST Component (18%)</span>
                  </div>
                  <span className="text-white">
                    ₹{gstAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <Separator className="bg-white/10 mt-6" />

              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5 mt-4">
                <BadgeAlert className="h-4 w-4 text-white/40" />
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-tight">
                  Proceeding will create a template used for studio quotations.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
