"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for Admin Project Detail Page
 */
export default function ProjectDetailLoading() {
  return (
    <div className="flex-1 space-y-10 p-8 md:p-12 max-w-7xl mx-auto w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-40 rounded-xl" />
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-8 space-y-12">
          <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
          <Skeleton className="h-[300px] w-full rounded-[2.5rem]" />
          <Skeleton className="h-[300px] w-full rounded-[2.5rem]" />
        </div>

        {/* Sidebar Skeleton */}
        <div className="lg:col-span-4 space-y-10">
          <Skeleton className="h-[350px] w-full rounded-[2.5rem]" />
          <Skeleton className="h-[200px] w-full rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  );
}
