"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Boxes } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { DetailHeader } from "./detail-header";

export function ProjectTypeDetail() {
  const params = useParams();
  const id = params.id as Id<"projectTypes">;

  // Query - get basic project type info
  const projectType = useQuery(
    api.functions.projectTypes.queries.getProjectTypeWithFields,
    { projectTypeId: id },
  );

  const { setOverride } = useBreadcrumbStore();

  // Sync breadcrumbs
  useEffect(() => {
    if (projectType?.name) setOverride(id, projectType.name);
  }, [id, projectType, setOverride]);

  // Loading & Error States
  if (projectType === undefined) {
    return (
      <div className="space-y-8 animate-pulse p-8 md:p-12">
        <Skeleton className="h-10 w-1/3 bg-white/5" />
        <div className="h-64 bg-white/5 rounded-3xl" />
      </div>
    );
  }

  if (!projectType) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 p-6">
        <Boxes className="h-12 w-12 text-white/10" />
        <p className="text-white/40 font-medium text-lg">
          Project Type not found
        </p>
        <Button variant="link" asChild className="text-primary">
          <Link href="/settings/project-types">Back to Project Types</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 p-8 md:p-12">
      <DetailHeader
        id={id}
        projectType={{
          name: projectType.name,
          categoryName: projectType.categoryName ?? "Uncategorized",
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6 lg:col-span-1">
          <div className="p-8 rounded-[32px] bg-white/3 border border-white/5 space-y-4">
            <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-4">
              Type Information
            </h3>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Status
              </span>
              <p className="font-bold text-white">
                {projectType.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            {projectType.description && (
              <div className="space-y-1">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  Description
                </span>
                <p className="text-sm text-white/60 leading-relaxed">
                  {projectType.description}
                </p>
              </div>
            )}
            {projectType.displayOrder !== undefined && (
              <div className="space-y-1">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  Display Order
                </span>
                <p className="font-bold text-white">
                  {projectType.displayOrder}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 p-12 rounded-[32px] bg-white/3 border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center mb-2">
            <Boxes className="h-8 w-8 text-white/20" />
          </div>
          <h3 className="text-xl font-black text-white uppercase italic">
            Configuration Migrated
          </h3>
          <p className="max-w-md text-white/40 font-medium text-sm leading-relaxed">
            Detailed configuration for this project type (including folder
            templates and pricing) has been moved to{" "}
            <Link
              href="/settings/service-packages"
              className="text-primary hover:underline"
            >
              Service Packages
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
