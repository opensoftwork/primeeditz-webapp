import { Skeleton } from "@/components/ui/skeleton";

export function QuotationRequestLoading() {
  return (
    <div className="space-y-12 pb-20">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-48 bg-white/5 rounded-full" />
        <Skeleton className="h-8 w-96 bg-white/5 rounded-xl" />
      </div>

      <div className="space-y-8">
        {/* Toolbar Skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-12 w-full md:w-64 bg-white/5 rounded-2xl" />
          <Skeleton className="h-12 w-32 bg-white/5 rounded-2xl" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              className="h-[280px] w-full bg-white/5 rounded-[1.8rem]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
