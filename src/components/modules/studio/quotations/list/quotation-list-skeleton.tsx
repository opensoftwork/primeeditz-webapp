"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function QuotationListSkeleton() {
  return (
    <div className="space-y-12 w-full p-6 md:p-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 bg-white/5 rounded-2xl" />
          <Skeleton className="h-4 w-96 bg-white/5 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-48 bg-white/5 rounded-2xl" />
          <Skeleton className="h-12 w-32 bg-white/5 rounded-2xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton
            key={i}
            className="h-64 rounded-[2.5rem] bg-white/5 border border-white/5"
          />
        ))}
      </div>
    </div>
  );
}
