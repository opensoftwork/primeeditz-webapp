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
  Database,
  Eye,
  FileText,
  FolderTree,
  HardDrive,
  Layers,
  Layout,
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
          categoryId:
            (step2Data.projectConfigs[0]
              ?.categoryId as Id<"projectCategories">) || undefined,
          projectConfigs: step2Data.projectConfigs.map((config) => ({
            id: config.id,
            label: config.label,
            categoryId: config.categoryId as Id<"projectCategories">,
            projectTypeId: config.projectTypeId,
            folderTemplateId: config.folderTemplateId,
            defaultStorageTierId: config.defaultStorageTierId,
          })),
          // Legacy fields
          projectTypeId: step2Data.projectConfigs[0]?.projectTypeId,
          folderTemplateId: step2Data.projectConfigs[0]?.folderTemplateId,
          defaultStorageTierId:
            step2Data.projectConfigs[0]?.defaultStorageTierId,

          lineItems: step3Data.lineItems.map((item) => ({
            id: item.id,
            sectionId: item.sectionId as Id<"quotationSections">,
            projectConfigId: item.projectConfigId,
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

  // No longer a single global category for the package
  // const categoryName = categories.find(
  //   (c) => c._id === step2Data?.categoryId,
  // )?.name;

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

            <Card className="bg-zinc-900/40 border-white/5 rounded-[32px] overflow-hidden glass-subtle hover:border-white/10 transition-colors shadow-2xl shadow-black/20 p-0">
              <CardContent className="p-0">
                <div className="px-8 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Layout className="h-4 w-4 text-primary" />
                    </div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">
                      Package Profile
                    </h4>
                  </div>
                </div>
                <div className="p-8 space-y-6">
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
                      <p className="text-xs text-white/50 leading-relaxed max-w-2xl font-medium">
                        {step1Data.description}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2.5 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                      <Package className="h-3.5 w-3.5 text-primary/60" />
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                        Composition:{" "}
                        <span className="text-white">
                          {step2Data?.projectConfigs.length || 0} Project Module
                          {step2Data?.projectConfigs.length !== 1 ? "s" : ""}
                        </span>
                      </span>
                    </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    className="group bg-zinc-900/40 border-white/5 rounded-[24px] overflow-hidden glass-subtle hover:border-primary/20 transition-all duration-300 shadow-xl"
                  >
                    <CardContent className="p-0">
                      {/* Compact Header */}
                      <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Layers className="h-3 w-3 text-primary" />
                          </div>
                          <h4 className="text-xs font-black text-white uppercase tracking-widest">
                            {config.label || "Untitled Project"}
                          </h4>
                        </div>
                        <Badge className="bg-white/5 text-white/40 border-white/10 font-bold text-[8px] uppercase tracking-[0.2em] px-2 py-0 rounded-sm leading-none h-5 flex items-center">
                          CFG {(index + 1).toString().padStart(2, "0")}
                        </Badge>
                      </div>

                      <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                          {/* Metadata Details - Left Side */}
                          <div className="space-y-4">
                            {/* Framework Info */}
                            <div className="space-y-2">
                              <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                <Rocket className="h-2.5 w-2.5 text-primary/60" />{" "}
                                Framework
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {config.categoryId && (
                                  <Badge className="bg-white/5 text-white/60 border-white/10 font-bold text-[8px] uppercase tracking-widest px-2 py-1 rounded-md">
                                    {
                                      categories.find(
                                        (c) => c._id === config.categoryId,
                                      )?.name
                                    }
                                  </Badge>
                                )}
                                <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest px-2 py-1 rounded-md">
                                  {type?.name || "Standard"}
                                </Badge>
                              </div>
                            </div>

                            {/* Storage Info */}
                            <div className="space-y-2">
                              <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                <HardDrive className="h-2.5 w-2.5 text-primary/60" />{" "}
                                Storage
                              </p>
                              <div className="flex items-center gap-2">
                                <Database className="h-3 w-3 text-primary/40" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                  {tier?.name || "Dynamic"}
                                </span>
                                <span className="text-[10px] text-white/20">
                                  •
                                </span>
                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">
                                  {tier?.sizeGB || "Uncapped"} GB
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Folder Structure - Right Side (Integrated) */}
                          <div className="relative pl-6 md:border-l border-white/5 flex flex-col justify-center space-y-3">
                            <div className="space-y-1">
                              <h5 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <FolderTree className="h-3.5 w-3.5 text-primary" />
                                Folder Hierarchy
                              </h5>
                              <p className="text-[9px] text-white/30 font-medium max-w-[200px] leading-relaxed">
                                Includes standardized directory structure for {type?.name || "this project type"}.
                              </p>
                            </div>

                            <Sheet>
                              <SheetTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-fit h-7 text-[9px] uppercase font-black tracking-[0.2em] bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30 text-white/60 hover:text-white rounded-lg transition-all px-3"
                                >
                                  View Architecture
                                </Button>
                              </SheetTrigger>
                              <SheetContent className="w-full sm:max-w-xl bg-zinc-950 border-l border-white/10 p-0 shadow-2xl">
                                <SheetHeader className="p-8 border-b border-white/10 bg-zinc-900/20 backdrop-blur-xl">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                      <FolderTree className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <SheetTitle className="text-xl font-black uppercase tracking-tight text-white leading-none">
                                        Hierarchy Architecture
                                      </SheetTitle>
                                      <SheetDescription className="text-[9px] text-primary/60 font-black uppercase tracking-widest mt-2">
                                        {config.label ||
                                          "Project Configuration"}
                                      </SheetDescription>
                                    </div>
                                  </div>
                                </SheetHeader>
                                <div className="h-[calc(100vh-130px)] overflow-y-auto custom-scrollbar p-6">
                                  <FolderPreview
                                    templateId={config.folderTemplateId}
                                  />
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
                  Pricing Summary
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

            <Card className="bg-zinc-900/40 border-white/5 rounded-[32px] overflow-hidden glass-subtle hover:border-white/10 transition-colors shadow-2xl shadow-black/20">
              <CardContent className="p-0">
                <div className="px-8 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">
                      Cost Structure
                    </h4>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div className="space-y-4">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                      <Save className="h-3 w-3" /> Itemized Breakdown
                    </p>
                    <div className="space-y-3">
                      {lineItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group/item hover:bg-white/5 -mx-2 px-2 rounded-xl transition-colors"
                        >
                          <div>
                            <p className="text-xs font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                              {item.description}
                            </p>
                            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-1">
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section: Terms & Conditions */}
          <div className="group space-y-4">
            <div className="flex items-center justify-between ml-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                  Terms & Conditions
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(4)}
                className="h-8 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest gap-1.5"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
            </div>

            <Card className="bg-zinc-900/40 border-white/5 rounded-[32px] overflow-hidden glass-subtle hover:border-white/10 transition-colors shadow-2xl shadow-black/20">
              <CardContent className="p-0">
                <div className="px-8 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">
                      Agreement Compliance
                    </h4>
                  </div>
                </div>
                <div className="p-8">
                  {step3Data?.terms ? (
                    <div className="space-y-4">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                        <Check className="h-3 w-3" /> Standardized Terms
                      </p>
                      <p className="text-[11px] text-white/50 leading-relaxed italic whitespace-pre-line font-medium bg-black/20 p-4 rounded-2xl border border-white/5">
                        {step3Data.terms}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <FileText className="h-10 w-10 text-white/5 mb-4" />
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                        No terms defined
                      </p>
                      <p className="text-[9px] text-white/20 mt-1 uppercase font-bold tracking-widest">
                        Standard legal backup will be applied
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
          <Card className="bg-zinc-900/40 border-white/5 rounded-[32px] overflow-hidden glass-subtle shadow-2xl shadow-black/20">
            <div className="p-0">
              <div className="px-8 py-6 border-b border-white/5 bg-white/5 space-y-1">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">
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

              <div className="p-8 space-y-6">
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

                <Separator className="bg-white/5" />

                <div className="flex items-start gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                  <BadgeAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-wide leading-relaxed">
                    Proceeding will create a template used for studio quotations.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
