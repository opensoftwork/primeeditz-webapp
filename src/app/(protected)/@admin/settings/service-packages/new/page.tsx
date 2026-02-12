"use client";

import {
  PackageBuilder,
  BuilderProvider,
} from "@/components/modules/admin/service-packages";

export default function NewServicePackagePage() {
  return (
    <div className="h-full">
      <BuilderProvider>
        <PackageBuilder />
      </BuilderProvider>
    </div>
  );
}
