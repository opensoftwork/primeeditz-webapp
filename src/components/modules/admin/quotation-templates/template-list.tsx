"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { FileText, Filter, LayoutList, Plus, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Template, TemplateLineItem } from "../quotation-sections/types";
import { TemplateCard } from "./template-card";

export function TemplateList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>("all");

  const templates = useQuery(
    api.functions.quotations.templates.queries.getTemplates,
    {
      activeOnly: false,
    },
  );

  const projectTypes = useQuery(api.admin.getProjectTypes);
  const updateTemplate = useMutation(
    api.functions.quotations.templates.mutations.updateTemplate,
  );
  const deleteTemplate = useMutation(
    api.functions.quotations.templates.mutations.deleteTemplate,
  );

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await updateTemplate({
        templateId: id as Id<"quotationTemplates">,
        isActive: !current,
      });
      toast.success(current ? "Template deactivated" : "Template activated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this template? Existing quotations will not be affected.",
      )
    ) {
      return;
    }
    try {
      await deleteTemplate({ templateId: id as Id<"quotationTemplates"> });
      toast.success("Template deleted");
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  const filteredTemplates = templates?.filter((t) => {
    const matchesSearch =
      !search || t.name.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      projectTypeFilter === "all" || t.projectTypeHint === projectTypeFilter;
    return matchesSearch && matchesType;
  });

  if (templates === undefined || projectTypes === undefined) {
    return (
      <div className="p-8 md:p-12 space-y-8 w-full">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56 bg-white/5" />
            <Skeleton className="h-3 w-40 bg-white/5" />
          </div>
          <Skeleton className="h-12 w-36 bg-white/5 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <LayoutList className="h-5 w-5 text-primary" />
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
              Quotation Templates
            </h1>
          </div>
          <p className="text-white/50 text-xs font-medium">
            Standardized pricing frameworks for rapid quotation generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/settings/quotation-templates/new")}
            className="bg-primary text-primary-foreground font-bold h-12 px-6 rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 p-1 rounded-xl bg-white/3 border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 bg-transparent border-none text-white h-11 text-sm font-bold placeholder:text-white/10 focus:ring-0"
          />
        </div>

        <div className="h-6 w-px bg-white/5 self-center hidden md:block" />

        <Select value={projectTypeFilter} onValueChange={setProjectTypeFilter}>
          <SelectTrigger className="w-full md:w-48 bg-transparent border-none text-white h-11 rounded-lg px-4 font-semibold text-xs focus:ring-0">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-white/40" />
              <SelectValue placeholder="All Types" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-zinc-900/95 backdrop-blur-xl border-white/10 text-white">
            <SelectItem value="all" className="text-xs font-semibold">
              All Types
            </SelectItem>
            {projectTypes
              .filter((pt) => pt.isActive)
              .map((pt) => (
                <SelectItem
                  key={pt._id}
                  value={pt._id}
                  className="text-xs font-bold"
                >
                  {pt.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {filteredTemplates?.length === 0 ? (
          /* ... existing empty state ... */
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col items-center justify-center p-20 rounded-[2rem] border border-dashed border-white/10 bg-white/2 space-y-4"
          >
            <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <FileText className="h-8 w-8 text-white/20" />
            </div>
            <div className="text-center">
              <h3 className="text-white text-lg font-bold">
                {search ? "No matching templates" : "No templates found"}
              </h3>
              <p className="text-sm text-white/40 mt-1">
                {search
                  ? "Try adjusting your search criteria"
                  : "Create your first template to get started"}
              </p>
            </div>
            {!search && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/settings/quotation-templates/new")}
                className="text-primary border-primary/20 hover:bg-primary/10 font-bold"
              >
                Create First Template
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
          >
            {filteredTemplates?.map((template, idx) => {
              const projectType = projectTypes.find(
                (pt) => pt._id === template.projectTypeHint,
              );

              const subtotal = (
                template.lineItems as TemplateLineItem[]
              ).reduce((acc: number, item: TemplateLineItem) => {
                const itemTotal = item.unitPrice * item.defaultQuantity;
                const subItemsTotal =
                  item.subItems?.reduce(
                    (s, sub) => s + sub.unitPrice * sub.defaultQuantity,
                    0,
                  ) ?? 0;
                return acc + itemTotal + subItemsTotal;
              }, 0);
              const gst = subtotal * 0.18;
              const total = subtotal + gst;

              return (
                <motion.div
                  key={template._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <TemplateCard
                    template={{
                      ...template,
                      projectTypeName: projectType?.name || null,
                      calculatedSubtotal: subtotal,
                      calculatedGst: gst,
                      calculatedTotal: total,
                    }}
                    onView={(t: Template) =>
                      router.push(`/settings/quotation-templates/${t._id}`)
                    }
                    onEdit={(t: Template) =>
                      router.push(`/settings/quotation-templates/${t._id}/edit`)
                    }
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
