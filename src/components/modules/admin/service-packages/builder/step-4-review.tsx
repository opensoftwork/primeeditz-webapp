"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useBuilder } from "./builder-context";
import { FolderPreview } from "./components/folder-preview";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { 
  Pencil, 
  ArrowLeft, 
  Check, 
  Eye, 
  Layers, 
  CreditCard, 
  FileText, 
  HardDrive,
  BadgeAlert,
  Save,
  Rocket,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Id } from "@convex/_generated/dataModel";

export function Step4Review() {
  const router = useRouter();
  const {
    step1Data,
    step2Data,
    step3Data,
    setCurrentStep,
    isEditing,
    packageId,
  } = useBuilder();

  // Queries
  const projectTypes = useQuery(api.functions.projectTypes.queries.list) || [];
  const categories = useQuery(api.functions.projectCategories.queries.getProjectCategories) || [];
  const storageTiers = useQuery(api.functions.storageTiers.queries.list) || [];

  // Mutations
  const createPackage = useMutation(api.functions.servicePackages.mutations.create);
  const updatePackage = useMutation(api.functions.servicePackages.mutations.update);

  const [isSaving, setIsSaving] = useState(false);

  // Totals Calculation
  const lineItems = step3Data?.lineItems ?? [];
  const subtotal = lineItems.reduce(
    (sum, item) => sum + (item.rate || 0) * (item.quantity || 1),
    0
  );
  const gstAmount = step3Data?.applyGST ? Math.round(subtotal * 0.18) : 0;
  const total = subtotal + gstAmount;

  async function handleSave(isActive: boolean) {
    if (!step1Data || !step2Data || !step3Data) {
      toast.error("Missing configuration data. Please complete all steps.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading(isEditing ? "Updating package..." : "Creating package...");

    try {
      const packageData = {
        name: step1Data.name,
        description: step1Data.description,
        categoryId: step1Data.categoryId as Id<"projectCategories"> || undefined,
        projectTypeId: step2Data.projectTypeId as Id<"projectTypes">,
        folderTemplateId: step2Data.folderTemplateId as Id<"folderTemplates">,
        defaultStorageTierId: step2Data.defaultStorageTierId as Id<"storageTiers"> || undefined,
        lineItems: step3Data.lineItems.map((item) => ({
          id: item.id,
          sectionId: item.sectionId as Id<"quotationSections"> || undefined,
          description: item.description,
          unit: item.unit,
          rate: item.rate,
          quantity: item.quantity,
        })),
        terms: step3Data.terms,
        isActive,
      };

      if (isEditing && packageId) {
        await updatePackage({ id: packageId, ...packageData });
        toast.success(`Package "${step1Data.name}" updated successfully`, { id: toastId });
      } else {
        await createPackage(packageData);
        toast.success(
          `Package "${step1Data.name}" ${isActive ? "published" : "saved as draft"}`,
          { id: toastId }
        );
      }

      router.push("/settings/service-packages");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save package. Check your values and try again.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  }

  const projectTypeName = projectTypes.find(t => t._id === step2Data?.projectTypeId)?.name;
  const categoryName = categories.find(c => c._id === step1Data?.categoryId)?.name;
  const storageTier = storageTiers.find(t => t._id === step2Data?.defaultStorageTierId);

  return (
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 space-y-2">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          Review & Finalize
        </h2>
        <p className="text-white/40 font-medium text-sm">
          A high-level overview of your service package before it goes live.
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
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Package Title</p>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight">{step1Data?.name}</h4>
                </div>
                
                {step1Data?.description && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Public Description</p>
                    <p className="text-sm text-white/50 leading-relaxed max-w-2xl">{step1Data.description}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                      Category: <span className="text-white">{categoryName || "None"}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                      Type: <span className="text-white">{projectTypeName}</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section: Configuration */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900/40 border-white/5 rounded-[32px] overflow-hidden glass-subtle">
                <CardContent className="p-6">
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Folder Structure Highlights</p>
                   <div className="max-h-[300px] overflow-y-auto">
                    <FolderPreview templateId={step2Data?.folderTemplateId} />
                   </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/40 border-white/5 rounded-[32px] overflow-hidden glass-subtle flex flex-col justify-center p-8">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <HardDrive className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Storage Allocation</p>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight">
                        {storageTier ? `${storageTier.name}` : "On-Demand"}
                      </h4>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                        {storageTier ? `${storageTier.sizeGB}GB Pre-allocated` : "Dynamic project storage"}
                      </p>
                    </div>
                 </div>
              </Card>
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
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Package Line Items</p>
                    <div className="space-y-3">
                      {lineItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/5">
                          <div>
                            <p className="text-xs font-black text-white uppercase tracking-tight">{item.description}</p>
                            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{item.quantity} × {item.unit}</p>
                          </div>
                          <span className="font-black text-white tracking-widest text-sm">₹{(item.rate * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {step3Data?.terms && (
                    <div className="pt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-white/20" />
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Terms of Service</p>
                      </div>
                      <p className="text-[11px] text-white/40 leading-relaxed italic">{step3Data.terms}</p>
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
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Total Package Value</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-white tracking-tighter italic">₹{total.toLocaleString()}</span>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">/ Start</p>
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
                   <span className="text-white">₹{gstAmount.toLocaleString()}</span>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-3 pt-2">
                <Button 
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  className="w-full h-14 bg-white hover:bg-white/90 text-primary font-black uppercase tracking-widest text-xs rounded-[20px] shadow-xl shadow-zinc-950/20 gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSaving ? "Saving..." : "Publish Package"}
                  {!isSaving && <Rocket className="h-4 w-4" />}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  className="w-full h-14 bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs rounded-[20px] transition-all gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save as Draft
                </Button>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                <BadgeAlert className="h-4 w-4 text-white/40" />
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-tight">
                  Proceeding will create a template used for studio quotations.
                </p>
              </div>
            </div>
          </Card>

          <Button
            variant="ghost"
            onClick={() => setCurrentStep(3)}
            className="w-full h-12 bg-white/2 hover:bg-white/5 text-white/20 hover:text-white font-black uppercase tracking-widest text-[9px] rounded-2xl transition-all gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pricing
          </Button>
        </div>
      </div>
    </div>
  );
}
