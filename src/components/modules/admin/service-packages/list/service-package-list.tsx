"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { Plus, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PackageCard } from "./package-card";
import { ListFilters } from "./list-filters";
import { ServicePackageListLoading } from "./service-package-list-loading";
import { ServicePackageListError } from "./service-package-list-error";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import type { Id } from "@convex/_generated/dataModel";

export function ServicePackageList() {
  const router = useRouter();
  
  // Local state for filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Convex Hooks
  const categories = useQuery(api.functions.projectCategories.queries.getProjectCategories) || [];
  const projectTypes = useQuery(api.functions.projectTypes.queries.list) || [];
  
  const packages = useQuery(api.functions.servicePackages.queries.list, {
    categoryId: categoryFilter === "all" ? undefined : (categoryFilter as Id<"projectCategories">),
    isActive: statusFilter === "all" ? undefined : statusFilter === "active",
    search: search || undefined,
  });

  const toggleActive = useMutation(api.functions.servicePackages.mutations.toggleActive);
  const duplicatePackage = useMutation(api.functions.servicePackages.mutations.duplicate);

  if (packages === undefined) return <ServicePackageListLoading />;
  if (packages === null) return <ServicePackageListError error="Failed to fetch packages" />;

  const handleCreate = () => {
    router.push("/settings/service-packages/new");
  };

  const handleEdit = (id: Id<"servicePackages">) => {
    router.push(`/settings/service-packages/${id}`);
  };

  const handleDuplicate = async (id: Id<"servicePackages">) => {
    try {
      const newId = await duplicatePackage({ id });
      toast.success("Package duplicated successfully");
      router.push(`/settings/service-packages/${newId}`);
    } catch (error) {
      toast.error("Failed to duplicate package");
    }
  };

  const handleToggleActive = async (id: Id<"servicePackages">, currentState: boolean) => {
    try {
      await toggleActive({ id, isActive: !currentState });
      toast.success(currentState ? "Package deactivated" : "Package activated");
    } catch (error) {
      toast.error("Failed to update package status");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Search and Filters Area */}
      <ListFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        categoryId={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
      />

      {/* Grid Area */}
      {packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {packages.map((pkg) => {
              const category = categories.find((c: any) => c._id === pkg.categoryId);
              const projectType = projectTypes.find((t: any) => t._id === pkg.projectTypeId);
              
              return (
                <PackageCard
                  key={pkg._id}
                  pkg={pkg}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onToggleActive={handleToggleActive}
                  categoryName={category?.name}
                  projectTypeName={projectType?.name}
                />
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-zinc-900/30 rounded-[32px] border border-white/5 border-dashed"
        >
          <div className="p-6 bg-white/5 rounded-[2.5rem] mb-6 relative">
            <PackageSearch className="h-12 w-12 text-white/10" />
            <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
            No packages found
          </h3>
          <p className="text-white/20 max-w-sm mx-auto mb-8 font-medium italic">
            {search || categoryFilter !== "all" || statusFilter !== "all" 
              ? "Try adjusting your filters to find what you're looking for." 
              : "Start by creating your first service package to populate your catalog."}
          </p>
          {!search && categoryFilter === "all" && statusFilter === "all" && (
            <Button 
              onClick={handleCreate}
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl gap-2 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Configure First Package
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}
