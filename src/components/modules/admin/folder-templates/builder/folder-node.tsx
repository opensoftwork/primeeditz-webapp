"use client";

import { Folder, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FolderLevel1, FolderLevel2, FolderLevel3 } from "@convex/schema";

interface FolderNodeProps {
  folder: FolderLevel1 | FolderLevel2 | FolderLevel3;
  level: 1 | 2 | 3;
  path: string; // Internal unique ID for editing/deleting
  onAddChild?: (parentPath: string) => void;
  onEdit: (path: string, folder: FolderLevel1 | FolderLevel2 | FolderLevel3) => void;
  onDelete: (path: string) => void;
}

export function FolderNode({
  folder,
  level,
  path,
  onAddChild,
  onEdit,
  onDelete,
}: FolderNodeProps) {
  const canHaveChildren = level < 3;

  return (
    <div 
      className={cn(
        "group flex items-center justify-between p-3 pr-4 rounded-xl transition-all border border-transparent hover:border-white/5 hover:bg-white/5",
        level === 1 && "bg-white/5 border-white/5 p-4",
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex items-center justify-center rounded-lg transition-colors",
          level === 1 ? "h-10 w-10 bg-primary/10 text-primary group-hover:bg-primary/20" : "h-8 w-8 bg-white/5 text-white/40 group-hover:text-white/60"
        )}>
          <Folder className={cn("transition-all", level === 1 ? "h-5 w-5" : "h-4 w-4")} />
        </div>
        
        <div className="flex flex-col">
          <span className={cn(
            "text-white/90 transition-colors group-hover:text-white font-bold leading-tight",
            level === 1 ? "text-sm tracking-wide uppercase" : "text-sm",
          )}>
            {folder.name}
          </span>
          {folder.description && (
            <span className="text-[10px] text-white/40 font-medium line-clamp-1 mt-0.5">
              {folder.description}
            </span>
          )}
        </div>

        {folder.isRequired && (
          <Badge className="bg-primary/20 text-primary border-primary/20 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full h-5">
            Required
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
        {canHaveChildren && onAddChild && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/5 transition-all mb-0.5"
            onClick={() => onAddChild(path)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/20 border border-white/5 transition-all text-white/60 hover:text-white mb-0.5"
          onClick={() => onEdit(path, folder)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-lg bg-red-500/5 hover:bg-red-500/20 hover:text-red-500 border border-red-500/10 transition-all mb-0.5"
          onClick={() => onDelete(path)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

