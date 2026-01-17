"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function QuotationListSkeleton() {
  return (
    <div className="p-8 md:p-12 space-y-8 w-full">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 bg-white/5 rounded-xl" />
        <Skeleton className="h-4 w-48 bg-white/5 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-64 bg-white/5 rounded-[2.5rem]" />
        ))}
      </div>
    </div>
  );
}
