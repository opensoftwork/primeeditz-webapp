"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  FileText,
  Info,
  Layers,
  ReceiptIndianRupee,
  Database,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailHeader } from "./components/detail-header";
import { GroupedPricingDisplay } from "./components/grouped-pricing-display";
import { ProjectConfigPreview } from "./components/project-config-preview";

export function PackageDetail({
  packageId,
}: {
  packageId: Id<"servicePackages">;
}) {
  const router = useRouter();
  const { setOverride, removeOverride } = useBreadcrumbStore();

  const pkg = useQuery(api.functions.servicePackages.queries.get, {
    id: packageId,
  });

  useEffect(() => {
    if (pkg?.name) {
      setOverride(packageId, pkg.name);
    }
    return () => removeOverride(packageId);
  }, [packageId, pkg?.name, setOverride, removeOverride]);
  const projectTypes = useQuery(api.functions.projectTypes.queries.list) || [];
  const folderTemplates =
    useQuery(api.functions.folderTemplates.queries.list) || [];
  const storageTiers =
    useQuery(api.functions.storageTiers.queries.listStorageTiers) || [];
  const categories =
    useQuery(api.functions.projectCategories.queries.getProjectCategories) ||
    [];

  if (pkg === undefined) {
    return (
      <div className="space-y-8 animate-pulse p-8 md:p-12">
        <div className="flex items-center justify-between">
          <Skeleton className="h-12 w-12 rounded-2xl bg-white/5" />
          <Skeleton className="h-12 w-48 bg-white/5 rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full bg-white/5 rounded-[32px]" />
      </div>
    );
  }

  if (pkg === null) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center h-[60vh]">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 mb-6">
          <Layers className="h-10 w-10 text-white/20" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          Package Not Found
        </h2>
        <p className="text-white/40 font-medium mt-2 max-w-md">
          The service package you are looking for may have been deleted or
          archived.
        </p>
        <Button
          variant="ghost"
          className="mt-8"
          onClick={() => router.push("/settings/service-packages")}
        >
          Back to Catalog
        </Button>
      </div>
    );
  }

  const category = categories.find((c) => c._id === pkg.categoryId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-8 pb-20 p-6 md:p-10"
    >
      <DetailHeader
        packageId={packageId}
        pkg={{
          name: pkg.name,
          categoryName: category?.name,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configurations & Pricing */}
        <div className="lg:col-span-8 space-y-10">
          {/* Project Delivery Config */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 ml-1">
              <Layers className="h-5 w-5 text-primary" />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
                Project Delivery Config
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {pkg.projectConfigs && pkg.projectConfigs.length > 0 ? (
                pkg.projectConfigs.map((config: any, i: number) => {
                  const type = projectTypes.find(
                    (t) => t._id === config.projectTypeId,
                  );
                  const template = folderTemplates.find(
                    (ht) => ht._id === config.folderTemplateId,
                  );
                  const tier = storageTiers.find(
                    (st) => st._id === config.defaultStorageTierId,
                  );

                  return (
                    <ProjectConfigPreview
                      key={i}
                      config={config}
                      projectTypeName={type?.name}
                      folderTemplateName={template?.name}
                      folderStructure={template?.folders}
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
                    defaultStorageTierId: pkg.defaultStorageTierId,
                  }}
                  projectTypeName={
                    projectTypes.find((t) => t._id === pkg.projectTypeId)?.name
                  }
                  folderTemplateName={
                    folderTemplates.find(
                      (ht) => ht._id === pkg.folderTemplateId,
                    )?.name
                  }
                  folderStructure={
                    folderTemplates.find(
                      (ht) => ht._id === pkg.folderTemplateId,
                    )?.folders
                  }
                  storageTierName={
                    storageTiers.find(
                      (st) => st._id === pkg.defaultStorageTierId,
                    )?.name
                  }
                />
              ) : (
                <div className="p-10 bg-white/2 border border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center text-center">
                  <Info className="h-8 w-8 text-white/10 mb-4" />
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                    No delivery workflow configured
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Pricing Breakdown */}
          <section className="space-y-4">
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

        {/* Right Column: Metadata & Terms */}
        <div className="lg:col-span-4 space-y-8">
          {/* Package Description Card */}
          <div className="p-8 rounded-[32px] bg-white/3 border border-white/5 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Info className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                About Package
              </span>
            </div>
            {pkg.description ? (
              <p className="text-sm font-medium text-white/70 leading-relaxed">
                {pkg.description}
              </p>
            ) : (
              <p className="text-xs italic text-white/30">
                No description provided.
              </p>
            )}

            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Status
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 ml-1">
              <FileText className="h-5 w-5 text-white/20" />
              <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">
                Terms & Conditions
              </h3>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-[32px] p-8">
              {pkg.terms ? (
                <p className="text-xs text-white/50 leading-loose whitespace-pre-wrap font-medium">
                  {pkg.terms}
                </p>
              ) : (
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-loose italic text-center">
                  Standard platform terms apply.
                </p>
              )}
            </div>
          </section>

          {/* Operational Note */}
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-[32px] p-8 space-y-4">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Database className="h-3.5 w-3.5" />
              System Behavior
            </h4>
            <p className="text-[11px] font-medium text-blue-400/60 leading-relaxed">
              When a quotation using this package is approved, the system will
              automatically provision
              <span className="text-blue-400 font-bold mx-1">
                {pkg.projectConfigs?.length || (pkg.projectTypeId ? 1 : 0)}{" "}
                project(s)
              </span>
              assigned to the respective categories.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
