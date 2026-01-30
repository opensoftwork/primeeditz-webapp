"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function FolderTemplateBuilderLoading() {
  return (
    <div className="w-full space-y-12 pb-32 font-geist px-10 pt-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/5">
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <Skeleton className="h-11 w-11 rounded-xl bg-white/5" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-9 w-72 bg-white/5" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-40 rounded-xl bg-white/5" />
          <Skeleton className="h-12 w-48 rounded-xl bg-white/5" />
        </div>
      </div>

      <div className="space-y-8">
        {/* Main Workspace */}
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3 ml-1">
              <Skeleton className="h-8 w-8 rounded-lg bg-white/5" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-white/5" />
                <Skeleton className="h-3 w-48 bg-white/5" />
              </div>
            </div>

            <Card className="relative overflow-hidden bg-zinc-900/40 border-white/5 p-1 rounded-[2.5rem] glass-subtle min-h-[600px]">
              <CardContent className="relative z-10 p-10 space-y-8">
                {/* Structure Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-xl bg-white/5" />
                      <Skeleton className="h-4 w-24 bg-white/5" />
                    </div>
                    <Skeleton className="h-9 w-40 rounded-xl bg-white/5" />
                  </div>
                  <Skeleton className="h-9 w-40 rounded-xl bg-white/5" />
                </div>

                {/* Breadcrumbs Skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-20 rounded-lg bg-white/5" />
                  <Skeleton className="h-8 w-24 rounded-lg bg-white/5" />
                  <Skeleton className="h-8 w-28 rounded-lg bg-white/5" />
                </div>

                {/* Back to previous & Limit Row */}
                <div className="flex items-center justify-between pt-4">
                  <Skeleton className="h-4 w-32 bg-white/5" />
                  <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-3 w-12 bg-white/5" />
                    <Skeleton className="h-2 w-20 bg-white/5" />
                  </div>
                </div>

                {/* Folder Grid Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-2xl border border-white/5 bg-white/2 flex flex-col items-center justify-center p-6 space-y-4"
                    >
                      <Skeleton className="h-16 w-16 rounded-2xl bg-white/5" />
                      <Skeleton className="h-4 w-20 bg-white/5" />
                      <Skeleton className="h-2 w-24 bg-white/5" />
                    </div>
                  ))}
                </div>

                {/* Footer Nesting Note Skeleton */}
                <div className="pt-8 border-t border-white/5 flex justify-center">
                  <Skeleton className="h-3 w-64 bg-white/5" />
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
