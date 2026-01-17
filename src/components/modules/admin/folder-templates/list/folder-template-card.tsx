"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FolderTree, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  ChevronRight,
  Layout
} from "lucide-react";
import { motion } from "motion/react";
import type { Doc } from "@convex/_generated/dataModel";

interface FolderTemplate extends Doc<"folderTemplates"> {
  projectTypeName: string;
}

interface FolderTemplateCardProps {
  template: FolderTemplate;
  onEdit: (template: FolderTemplate) => void;
  onDeleteRequest: (id: string, name: string) => void;
}

export function FolderTemplateCard({
  template,
  onEdit,
  onDeleteRequest,
}: FolderTemplateCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group relative overflow-hidden bg-zinc-900/50 border-white/5 p-6 rounded-[32px] transition-all hover:bg-white/[0.04] hover:border-white/10 hover:shadow-2xl hover:shadow-primary/5">
        {/* Glow Effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 blur-[100px] rounded-full group-hover:bg-primary/10 transition-colors" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <FolderTree className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              {template.isDefault && (
                <Badge className="bg-primary/20 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full">
                  DEFAULT
                </Badge>
              )}
              <Badge
                className={`${
                  template.isActive
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : "bg-white/5 text-white/40 border-white/5"
                } font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full`}
              >
                {template.isActive ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </div>
          </div>

          {/* Title & Type */}
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white uppercase tracking-tight line-clamp-1">
              {template.name}
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
              <Layout className="h-3 w-3" />
              {template.projectTypeName}
            </div>
          </div>

          {/* Folder Preview */}
          <div className="space-y-3">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
              Folder Structure ({template.folders.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {template.folders.slice(0, 4).map((folder, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-white/60 transition-colors group-hover:border-white/10"
                >
                  <div className="w-1 h-1 rounded-full bg-primary/40" />
                  {folder}
                </div>
              ))}
              {template.folders.length > 4 && (
                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-white/20 uppercase tracking-widest">
                  +{template.folders.length - 4} More
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={() => onEdit(template)}
              className="flex-1 bg-white/[0.03] hover:bg-white/10 text-white border border-white/5 font-black uppercase tracking-widest text-[9px] h-10 rounded-2xl group/btn"
            >
              <Edit3 className="mr-2 h-3.5 w-3.5 transition-transform group-hover/btn:scale-110" />
              Configure
            </Button>
            <Button
              onClick={() => onDeleteRequest(template._id, template.name)}
              className="px-3 bg-red-500/5 hover:bg-red-500/20 text-red-500 border border-red-500/10 h-10 rounded-2xl transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
