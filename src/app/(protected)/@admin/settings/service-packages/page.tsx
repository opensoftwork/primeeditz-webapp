"use client";

import { ServicePackageList } from "@/components/modules/admin/service-packages";

export default function ServicePackagesPage() {
  return (
    <div className="flex-1 p-8 md:p-12 w-full">
      <ServicePackageList />
    </div>
  );
}
