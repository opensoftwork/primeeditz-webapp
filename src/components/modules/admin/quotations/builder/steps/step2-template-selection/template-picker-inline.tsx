"use client";

import {
  Search,
  Layout,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Template } from "../../types";

interface TemplatePickerInlineProps {
  templates: Template[] | undefined;
  selectedTemplateId: string | undefined;
  onSelectTemplate: (templateId: string) => void;
  onCancel: () => void;
}

export function TemplatePickerInline({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onCancel,
}: TemplatePickerInlineProps) {
  const [search, setSearch] = useState("");
  
  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Reduced slightly for inline layout

  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    if (!search) return templates;
    const lowerSearch = search.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerSearch) ||
        (t.description && t.description.toLowerCase().includes(lowerSearch))
    );
  }, [templates, search]);

  const totalPages = Math.ceil(filteredTemplates.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTemplates = filteredTemplates.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleSelect = (id: string) => {
    onSelectTemplate(id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-10 space-y-8 px-8 pb-8 relative border border-white/5 bg-white/1 rounded-4xl"
    >
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-8">
        <div className="space-y-1">
          <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Layout className="h-4 w-4" />
            </div>
            Template Gallery
          </h3>
          <p className="text-sm text-white/40 font-medium">
            Select a template from your library
          </p>
        </div>
        
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Filter templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-zinc-950 border-white/5 rounded-2xl text-sm font-bold placeholder:text-white/10 focus:border-primary/50 transition-all"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-12 px-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
        </div>
      </div>

      {/* Template Grid/List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {paginatedTemplates.map((template) => {
            const isSelected = selectedTemplateId === template._id;
            return (
              <motion.div
                key={template._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  "group p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden cursor-pointer",
                  isSelected
                    ? "bg-primary/5 border-primary/30"
                    : "bg-zinc-950 border-white/5 hover:bg-white/5 hover:border-white/10"
                )}
                onClick={() => handleSelect(template._id)}
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center border transition-all",
                      isSelected 
                        ? "bg-primary/20 border-primary/40 text-primary" 
                        : "bg-white/5 border-white/10 text-white/20"
                    )}>
                      <Layout className="h-5 w-5" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">
                          {template.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className="h-5 text-[8px] font-black uppercase tracking-widest bg-white/5 border-white/10 text-white/40"
                        >
                          {template.lineItems.length} ITEMS
                        </Badge>
                        {isSelected && (
                          <Badge
                            variant="outline"
                            className="h-5 text-[8px] font-black uppercase tracking-widest bg-emerald-500/20 border-emerald-500/40 text-emerald-500"
                          >
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] font-medium text-white/40 line-clamp-1 leading-relaxed">
                          {template.description || "No description provided"}
                      </p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center border transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                        : "bg-white/5 border-white/10 text-white/20 group-hover:text-white/40 group-hover:bg-white/10"
                    )}
                  >
                    {isSelected ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </div>
                </div>

                {/* Selection Highlight */}
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/2 pointer-events-none" />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredTemplates.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="h-16 w-16 rounded-3xl bg-white/2 border border-white/5 flex items-center justify-center mx-auto text-white/10">
              <Layout className="h-8 w-8" />
            </div>
            <p className="text-white/20 font-black uppercase tracking-widest text-xs italic">
              No templates found matching your search
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
            Showing Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white disabled:opacity-20"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white disabled:opacity-20"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
