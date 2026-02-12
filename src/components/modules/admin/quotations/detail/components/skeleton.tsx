"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function QuotationDetailSkeleton() {
  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 w-full">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton className="h-5 w-32 bg-white/5" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl bg-white/5" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 bg-white/5" />
              <Skeleton className="h-4 w-32 bg-white/5" />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-xl bg-white/5" />
          <Skeleton className="h-10 w-24 rounded-xl bg-white/5" />
          <Skeleton className="h-10 w-32 rounded-xl bg-white/5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-32 rounded-2xl bg-white/5" />
          <Skeleton className="h-64 rounded-2xl bg-white/5" />
          <Skeleton className="h-48 rounded-2xl bg-white/5" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-2xl bg-white/5" />
          <Skeleton className="h-40 rounded-2xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}
