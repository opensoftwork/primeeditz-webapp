"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function FolderGridSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <Skeleton className="h-4 w-32 bg-white/5 rounded-lg" />
        <div className="flex items-center gap-6">
          <Skeleton className="h-4 w-20 bg-white/5 rounded-lg" />
          <Skeleton className="h-4 w-20 bg-white/5 rounded-lg" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-3xl bg-white/3 border border-white/5 space-y-5"
          >
            <div className="flex items-start gap-4">
              <Skeleton className="h-11 w-11 rounded-2xl bg-white/5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-1/2 bg-white/5 rounded-lg" />
                  <Skeleton className="h-8 w-24 bg-white/5 rounded-xl" />
                </div>
                <Skeleton className="h-3 w-1/3 bg-white/5 rounded-lg" />
              </div>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <Skeleton className="h-3 w-20 bg-white/5 rounded-lg" />
              <Skeleton className="h-1.5 w-1.5 rounded-full bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
