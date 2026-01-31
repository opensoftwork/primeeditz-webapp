"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  Edit2,
  Eye,
  EyeOff,
  FolderTree,
  Loader2,
  MoreVertical,
  Settings2,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutationWithStatus } from "@/lib/convex-hooks";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

import type { AdminProjectType } from "./types";

interface ProjectTypeCardProps {
  type: AdminProjectType;
  onEdit: (type: AdminProjectType) => void;
  onDelete: (id: Id<"projectTypes">, name: string) => void;
}

export function ProjectTypeCard({
  type,
  onEdit,
  onDelete,
}: ProjectTypeCardProps) {
  const router = useRouter();
  const toggleStatusMutation = useMutationWithStatus(
    api.functions.projectTypes.mutations.toggleProjectTypeActive,
  );

  useEffect(() => {
    if (toggleStatusMutation.isSuccess) {
      toast.success("Status updated successfully");
    }
    if (toggleStatusMutation.isError) {
      toast.error("Failed to update status");
    }
  }, [toggleStatusMutation.isSuccess, toggleStatusMutation.isError]);

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleStatusMutation.mutate({
      id: type._id as Id<"projectTypes">,
      isActive: !type.isActive,
    });
  };

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card
        className={cn(
          "group relative overflow-hidden bg-white/2 border-white/5 p-6 rounded-3xl transition-all hover:bg-white/4 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5",
          type.isDraft && "border-amber-500/20 bg-amber-500/5",
        )}
      >
        {/* Glow Effect */}
        <div
          className={cn(
            "absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full translate-x-16 -translate-y-16 transition-colors",
            type.isDraft
              ? "bg-amber-500/10 group-hover:bg-amber-500/20"
              : "bg-primary/5 group-hover:bg-primary/10",
          )}
        />

        <div className="relative z-10 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl bg-linear-to-br border flex items-center justify-center transition-colors",
                  type.isDraft
                    ? "from-amber-500/20 to-amber-500/5 border-amber-500/20 group-hover:border-amber-500/30"
                    : "from-primary/20 to-primary/5 border-primary/20 group-hover:border-primary/30",
                )}
              >
                <DynamicIcon
                  name={
                    type.icon || (type.isDraft ? "DraftingCompass" : "Package")
                  }
                  className={cn(
                    "h-5 w-5",
                    type.isDraft ? "text-amber-500" : "text-primary",
                  )}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                  {type.categoryName || "PROJECT ENGINE"}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge
                    className={cn(
                      "w-fit font-black text-[7px] uppercase tracking-widest px-1.5 py-0 rounded-md relative overflow-hidden",
                      type.isActive
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-white/5 text-white/40 border-white/5",
                    )}
                  >
                    {type.isActive ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                  {type.isDraft && (
                    <Badge className="w-fit font-black text-[7px] uppercase tracking-widest px-1.5 py-0 rounded-md bg-amber-500/10 text-amber-500 border-amber-500/20">
                      DRAFT
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg border border-white/5 bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-zinc-950 border-white/10 rounded-2xl p-2 glass"
              >
                <DropdownMenuItem
                  onClick={() => onEdit(type)}
                  className="rounded-xl flex items-center gap-3 p-3 text-[10px] font-black uppercase tracking-widest text-white/60 focus:text-white focus:bg-white/5 cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit Configuration
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `/settings/project-types/${type._id}/folder-templates`,
                    )
                  }
                  className="rounded-xl flex items-center gap-3 p-3 text-[10px] font-black uppercase tracking-widest text-white/60 focus:text-white focus:bg-white/5 cursor-pointer"
                >
                  <FolderTree className="h-3.5 w-3.5" />
                  Manage Templates
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5 mx-2 my-2" />
                <DropdownMenuItem
                  onClick={() => onDelete(type._id, type.name)}
                  className="rounded-xl flex items-center gap-3 p-3 text-[10px] font-black uppercase tracking-widest text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Permanently
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title Area */}
          <div className="space-y-1">
            <h3
              className={cn(
                "text-xl font-black uppercase tracking-tight line-clamp-1 transition-colors",
                type.isDraft
                  ? "text-amber-500 group-hover:text-amber-400"
                  : "text-white group-hover:text-primary",
              )}
            >
              {type.name}
            </h3>
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary/60">
              {type.isDraft
                ? "PRELIMINARY ARCHITECTURE DRAFT"
                : "SYSTEM ARCHITECTURE CONFIGURATION"}
            </div>
          </div>

          {/* Footer Area */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <Settings2 className="h-3.5 w-3.5 text-white/20" />
              </div>
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">
                Field Mapping Enabled
              </span>
            </div>

            <Button
              onClick={handleToggleStatus}
              disabled={toggleStatusMutation.isPending}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg gap-2 shrink-0 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                type.isActive
                  ? "text-red-400/60 bg-red-400/5 hover:text-red-400 hover:bg-red-400/10"
                  : "text-green-400/60 bg-green-400/5 hover:text-green-400 hover:bg-green-400/10",
              )}
            >
              {toggleStatusMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : type.isActive ? (
                <>
                  DEACTIVATE <EyeOff className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  ACTIVATE <Eye className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
