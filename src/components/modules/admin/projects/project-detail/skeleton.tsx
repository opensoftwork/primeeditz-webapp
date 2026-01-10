"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading Skeleton for Project Detail
 */
export function ProjectDetailSkeleton() {
  return (
    <div className="flex-1 space-y-10 p-8 md:p-12 w-full animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-12 w-40 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          <Skeleton className="h-64 w-full rounded-[2.5rem]" />
          <Skeleton className="h-48 w-full rounded-[2.5rem]" />
        </div>
        <div className="lg:col-span-4 space-y-10">
          <Skeleton className="h-80 w-full rounded-[2.5rem]" />
          <Skeleton className="h-40 w-full rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  );
}
