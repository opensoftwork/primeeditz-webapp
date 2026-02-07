"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "motion/react";
import { Building2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyForm } from "./company-form";

export function CompanySettings() {
  const company = useQuery(api.functions.company.queries.get);
  const updateCompany = useMutation(api.functions.company.mutations.update);

  const handleSubmit = async (values: any) => {
    try {
      await updateCompany(values);
      toast.success("Company profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update company profile");
    }
  };

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
    <div className="space-y-16">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2 italic">Company Profile</h1>
        <p className="text-sm text-white/40 font-bold tracking-tight">Manage your studio's identity and billing information.</p>
      </div>

      <div className="max-w-4xl">
        <CompanyForm initialData={company} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
