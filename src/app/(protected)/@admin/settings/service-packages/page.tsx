"use client";

import { ServicePackageList } from "@/components/modules/admin/service-packages";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ServicePackagesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Packages"
        description="Configure your service offerings for studios"
      >
        <Button
          onClick={() => router.push("/settings/service-packages/new")}
          className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 group"
        >
          <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
          Create New Package
        </Button>
      </PageHeader>
      <ServicePackageList />
    </div>
  );
}
