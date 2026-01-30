"use client";

import type { Doc } from "@convex/_generated/dataModel";
import {
  CheckCircle2,
  ChevronRight,
  Edit3,
  FolderTree,
  Layout,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FolderTemplate extends Doc<"folderTemplates"> {
  projectTypeName: string;
}

export function FolderTemplateCard({
  template,
  onEdit,
  onDelete,
}: {
  template: FolderTemplate;
  onEdit: (template: FolderTemplate) => void;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <motion.div layout whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="group relative overflow-hidden bg-white/2 border-white/5 p-6 rounded-3xl transition-all hover:bg-white/4 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors" />

        <div className="relative z-10 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                <FolderTree className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                  {template.projectTypeName || "General Template"}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  {template.isDefault && (
                    <Badge className="bg-primary/20 text-primary border-primary/20 font-black text-[7px] uppercase tracking-widest px-1.5 py-0 rounded-md">
                      DEFAULT
                    </Badge>
                  )}
                  <Badge
                    className={cn(
                      "font-black text-[7px] uppercase tracking-widest px-1.5 py-0 rounded-md",
                      template.isActive
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-white/5 text-white/40 border-white/5",
                    )}
                  >
                    {template.isActive ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10"
                onClick={() => onDelete(template._id, template.name)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Title Area */}
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
              {template.name}
            </h3>
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary/60">
              <Layout className="h-3 w-3" />
              Static Directory Blueprint
            </div>
          </div>

          {/* Folder Preview Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                Folder Architecture
              </span>
              <span className="text-[8px] font-black text-primary/40 uppercase tracking-widest">
                {template.folders.length} Volumes
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {template.folders.slice(0, 3).map((folder, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/3 border border-white/5 text-[9px] font-bold text-white/50 transition-colors group-hover:bg-white/5"
                >
                  <div className="w-1 h-1 rounded-full bg-primary/40" />
                  {folder.name}
                </div>
              ))}
              {template.folders.length > 3 && (
                <div className="px-3 py-1.5 rounded-xl bg-white/2 border border-white/5 text-[9px] font-black text-white/20 uppercase tracking-widest">
                  +{template.folders.length - 3} More
                </div>
              )}
            </div>
          </div>

          {/* Footer Area */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <ChevronRight className="h-3 w-3 text-white/20" />
              </div>
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">
                Template Version 1.0.4
              </span>
            </div>
            <Button
              onClick={() => onEdit(template)}
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg gap-2 shrink-0 transition-all active:scale-95"
            >
              Configure <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
