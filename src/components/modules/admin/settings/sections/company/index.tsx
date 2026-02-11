"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyForm } from "./company-form";

export function CompanySettings() {
  const company = useQuery(api.functions.company.queries.get);

  if (company === undefined) {
    return (
      <div className="w-full px-6 pt-6 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 bg-white/5" />
          <Skeleton className="h-12 w-64 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-2xl bg-white/5" />
          <Skeleton className="h-[400px] rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full px-1">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-1">
            Company Profile
          </h1>
          <p className="text-sm text-white/40 font-medium tracking-tight">
            Manage your studio's identity and billing information.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <CompanyForm initialData={company} />
      </div>
    </div>
  );
}
