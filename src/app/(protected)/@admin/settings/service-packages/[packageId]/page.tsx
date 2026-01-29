"use client";

import { PackageBuilder, BuilderProvider } from "@/components/modules/admin/service-packages";
import { useParams } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";

export default function EditServicePackagePage() {
  const params = useParams();
  const packageId = params.packageId as Id<"servicePackages">;

  return (
    <div className="p-8 md:p-12">
      <BuilderProvider packageId={packageId}>
        <PackageBuilder />
      </BuilderProvider>
    </div>
  );
}
