"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Plus, Trash2, ListOrdered, Palette, Type } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function QuotationConfig() {
  const sections = useQuery(api.functions.quotationSections.queries.listActive) || [];
  // Note: I'm assuming these mutations exist or I will create them
  // const createSection = useMutation(api.functions.quotationSections.mutations.create);
  // const updateSection = useMutation(api.functions.quotationSections.mutations.update);
  // const deleteSection = useMutation(api.functions.quotationSections.mutations.remove);

  return (
    <div className="space-y-16">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2 italic">Quotation Config</h1>
        <p className="text-sm text-white/40 font-bold tracking-tight">Manage proposal sections and reusable line items.</p>
      </div>

      {/* Sections Management */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ListOrdered className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white">Proposal Sections</h2>
          </div>
          <Button variant="outline" className="h-10 rounded-xl bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest text-primary gap-2">
            <Plus className="h-4 w-4" />
            Add New Section
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section: any) => (
            <div key={section._id} className="group p-5 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-between hover:bg-white/5 transition-all">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border",
                  `bg-${section.color || 'zinc'}-500/10 border-${section.color || 'zinc'}-500/20`
                )}>
                  <Palette className={cn("h-4 w-4", `text-${section.color || 'zinc'}-500`)} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight text-white">{section.name}</p>
                  <p className="text-[10px] font-bold text-white/20 tracking-widest uppercase">Order: {section.displayOrder || 0}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg text-white/20 hover:text-white">
                  <Type className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg text-red-500/20 hover:text-red-500 hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Helper function needed for colors
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
