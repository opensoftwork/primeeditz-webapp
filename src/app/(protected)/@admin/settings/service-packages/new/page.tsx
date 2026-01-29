"use client";

import { PackageBuilder, BuilderProvider } from "@/components/modules/admin/service-packages";

export default function NewServicePackagePage() {
  return (
    <div className="p-8 md:p-12">
      <BuilderProvider>
        <PackageBuilder />
      </BuilderProvider>
    </div>
  );
}
