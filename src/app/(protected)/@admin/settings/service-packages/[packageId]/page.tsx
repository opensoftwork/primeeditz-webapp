"use client";

import { PackageDetail } from "@/components/modules/admin/service-packages";
import { useParams } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";

export default function ServicePackageDetailPage() {
  const params = useParams();
  const packageId = params.packageId as Id<"servicePackages">;

  return (
    <div className="p-8 md:p-12">
      <PackageDetail packageId={packageId} />
    </div>
  );
}
