"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  Layout,
  Pencil,
  ReceiptIndianRupee,
  Layers,
  FileText,
  Info,
  Tag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectConfigPreview } from "./components/project-config-preview";
import { GroupedPricingDisplay } from "./components/grouped-pricing-display";

export function PackageDetail({ packageId }: { packageId: Id<"servicePackages"> }) {
  const router = useRouter();
  
  const pkg = useQuery(api.functions.servicePackages.queries.get, { id: packageId });
  const projectTypes = useQuery(api.functions.projectTypes.queries.list) || [];
  const folderTemplates = useQuery(api.functions.folderTemplates.queries.list) || [];
  const storageTiers = useQuery(api.functions.storageTiers.queries.listStorageTiers) || [];
  const categories = useQuery(api.functions.projectCategories.queries.getProjectCategories) || [];

  if (pkg === undefined) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32 bg-white/5" />
          <Skeleton className="h-10 w-32 bg-white/5" />
        </div>
        <Skeleton className="h-64 w-full bg-white/5 rounded-3xl" />
      </div>
    );
  }

  if (pkg === null) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Package Not Found</h2>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>Back to Catalog</Button>
      </div>
    );
  }

  const category = categories.find((c) => c._id === pkg.categoryId);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-2xl gap-2 transition-all active:scale-95 border border-white/5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Button>

        <Button
          onClick={() => router.push(`/settings/service-packages/${packageId}/edit`)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-2xl shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Edit Configuration
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative group">
        <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-transparent blur-3xl opacity-20 -z-10" />
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <Badge className="bg-primary font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1 rounded-lg">
               Service Package
             </Badge>
             {category && (
               <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
                 <Tag className="h-3 w-3" />
                 {category.name}
               </div>
             )}
          </div>
          <h1 className="text-5xl xl:text-6xl font-black text-white uppercase tracking-tighter">
            {pkg.name}
          </h1>
          {pkg.description && (
            <p className="text-lg text-white/40 max-w-3xl leading-relaxed italic font-medium">
              "{pkg.description}"
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Configurations */}
        <div className="lg:col-span-8 space-y-12">
          {/* Project Delivery Config */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 ml-1">
              <Layers className="h-5 w-5 text-primary" />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
                Project Delivery Config
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pkg.projectConfigs && pkg.projectConfigs.length > 0 ? (
                pkg.projectConfigs.map((config: any, i: number) => {
                  const type = projectTypes.find((t) => t._id === config.projectTypeId);
                  const template = folderTemplates.find((ht) => ht._id === config.folderTemplateId);
                  const tier = storageTiers.find((st) => st._id === config.defaultStorageTierId);
                  
                  return (
                    <ProjectConfigPreview 
                      key={i}
                      config={config}
                      projectTypeName={type?.name}
                      folderTemplateName={template?.name}
                      storageTierName={tier?.name}
                    />
                  );
                })
              ) : pkg.projectTypeId ? (
                  /* Legacy Compatibility */
                  <ProjectConfigPreview 
                    config={{
                      label: "Standard Config",
                      projectTypeId: pkg.projectTypeId,
                      folderTemplateId: pkg.folderTemplateId as string,
                      defaultStorageTierId: pkg.defaultStorageTierId
                    }}
                    projectTypeName={projectTypes.find(t => t._id === pkg.projectTypeId)?.name}
                    folderTemplateName={folderTemplates.find(ht => ht._id === pkg.folderTemplateId)?.name}
                    storageTierName={storageTiers.find(st => st._id === pkg.defaultStorageTierId)?.name}
                  />
              ) : (
                <div className="col-span-full p-10 bg-white/2 border border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center text-center">
                   <Info className="h-8 w-8 text-white/10 mb-4" />
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                     No delivery workflow configured
                   </p>
                </div>
              )}
            </div>
          </section>

          {/* Pricing Breakdown */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 ml-1">
              <ReceiptIndianRupee className="h-5 w-5 text-primary" />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
                Cost Structure & Billing
              </h3>
            </div>
            
            <GroupedPricingDisplay 
              lineItems={pkg.lineItems}
              projectConfigs={pkg.projectConfigs || []}
              applyGST={pkg.applyGST ?? true}
            />
          </section>
        </div>

        {/* Right Column: Terms & Metadata */}
        <div className="lg:col-span-4 space-y-12">
          {/* Terms */}
          <section className="space-y-6">
             <div className="flex items-center gap-3 ml-1">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
                Terms & Conditions
              </h3>
            </div>
            <div className="bg-white/2 border border-white/5 rounded-[32px] p-8 glass-subtle">
              {pkg.terms ? (
                <p className="text-xs text-white/50 leading-loose whitespace-pre-wrap font-medium uppercase tracking-wider">
                  {pkg.terms}
                </p>
              ) : (
                <div className="bg-white/2 rounded-2xl p-6 border border-white/5 italic">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-loose">
                    No custom terms defined for this package. Standard platform terms will apply.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Tips/Info */}
          <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-8 space-y-4">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
              <Info className="h-4 w-4" />
              Operational Note
            </h4>
            <p className="text-[11px] font-medium text-primary/60 leading-relaxed uppercase tracking-widest">
              Approving a quotation with this package will automatically spawn all configured projects with their respective hierarchies and storage tiers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
