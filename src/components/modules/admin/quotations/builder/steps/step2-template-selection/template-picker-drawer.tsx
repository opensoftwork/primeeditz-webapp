"use client";

import {
  Search,
  Layout,
  Hash,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Template } from "../../types";

interface TemplatePickerDrawerProps {
  templates: Template[] | undefined;
  selectedTemplateId: string | undefined;
  onSelectTemplate: (templateId: string) => void;
  children?: React.ReactNode;
}

export function TemplatePickerDrawer({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  children,
}: TemplatePickerDrawerProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  // Pagination logic optional but good for consistency
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

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
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[450px] bg-zinc-950 border-white/10 p-0 sm:max-w-none"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="p-8 pb-4">
            <div className="space-y-1">
              <SheetTitle className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Layout className="h-5 w-5" />
                </div>
                Template Gallery
              </SheetTitle>
              <SheetDescription className="text-sm text-white/40 font-medium italic">
                Select a template to apply to your project
              </SheetDescription>
            </div>

            <div className="pt-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 h-12 bg-white/2 border-white/5 rounded-2xl text-sm font-bold placeholder:text-white/10 focus:border-primary/50 transition-all shadow-inner"
                />
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
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
                          : "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10"
                      )}
                      onClick={() => handleSelect(template._id)}
                    >
                      <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                              <Layout className="h-3 w-3 text-white/40" />
                            </div>
                            <span className="text-xs font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight">
                              {template.lineItems.length} ITEMS
                            </span>
                            {isSelected && (
                              <Badge
                                variant="outline"
                                className="h-5 text-[8px] font-black uppercase tracking-widest bg-primary/20 border-primary/40 text-primary animate-pulse"
                              >
                                Active
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                              {template.name}
                            </h4>
                            <p className="text-[10px] font-medium text-white/40 line-clamp-2 leading-relaxed">
                                {template.description || "No description provided"}
                            </p>
                          </div>
                        </div>

                        <div
                          className={cn(
                            "h-8 w-8 rounded-xl flex items-center justify-center border transition-all",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                              : "bg-white/5 border-white/10 text-white/20 group-hover:text-white/40 group-hover:bg-white/10"
                          )}
                        >
                          {isSelected ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </div>
                      </div>

                      {/* Accent Glow */}
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl rounded-full translate-x-12 -translate-y-12" />
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
                    No templates found
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-8 border-t border-white/5 bg-white/1 flex items-center justify-between">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
