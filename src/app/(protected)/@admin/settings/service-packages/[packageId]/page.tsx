"use client";

import { PackageDetail } from "@/components/modules/admin/service-packages";
import { useParams } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";

export default function ServicePackageDetailPage() {
  const params = useParams();
  const packageId = params.packageId as Id<"servicePackages">;

  return (
    <div>
      <PackageDetail packageId={packageId} />
    </div>
  );
}
