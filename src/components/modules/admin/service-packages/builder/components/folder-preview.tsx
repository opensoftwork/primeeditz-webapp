"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { CheckCircle2, ChevronDown, ChevronRight, Folder } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface FolderPreviewProps {
  templateId: string | undefined;
}

export function FolderPreview({ templateId }: FolderPreviewProps) {
  const template = useQuery(
    api.functions.folderTemplates.queries.get,
    templateId ? { id: templateId as Id<"folderTemplates"> } : "skip",
  );

  if (!templateId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-4">
          <Folder className="h-8 w-8 text-white/10" />
        </div>
        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest max-w-[140px]">
          Select a template to preview structure
        </p>
      </div>
    );
  }

  if (template === undefined) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-6 w-full bg-white/5 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-8 text-center text-red-400 text-[10px] font-black uppercase tracking-widest">
        Template not found
      </div>
    );
  }

  return (
    <div className="p-6 space-y-2 animate-in fade-in duration-500 overflow-y-auto max-h-[400px]">
      <div className="flex items-center gap-2 mb-6 ml-1">
        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">
          {template.folders.length} Root Folders
        </h4>
      </div>

      <div className="space-y-1">
        {template.folders.map((folder: any, idx: number) => (
          <FolderNode key={`${idx}-${folder.name}`} folder={folder} level={0} />
        ))}
      </div>
    </div>
  );
}

function FolderNode({ folder, level }: { folder: any; level: number }) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-lg transition-all group",
          level === 0 ? "hover:bg-white/5" : "hover:bg-white/3",
        )}
        style={{ marginLeft: `${level * 12}px` }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "p-0.5 rounded cursor-pointer transition-colors",
            hasChildren ? "hover:bg-white/10" : "opacity-0 pointer-events-none",
          )}
          aria-label={isOpen ? "Collapse folder" : "Expand folder"}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <ChevronDown className="h-3 w-3 text-white/40" />
          ) : (
            <ChevronRight className="h-3 w-3 text-white/40" />
          )}
        </button>

        <Folder
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            level === 0
              ? "text-primary/60 group-hover:text-primary"
              : "text-white/20 group-hover:text-white/40",
          )}
        />

        <span
          className={cn(
            "text-xs font-medium transition-colors whitespace-nowrap",
            level === 0 ? "text-white/90" : "text-white/60",
          )}
        >
          {folder.name}
        </span>

        {folder.isRequired && (
          <CheckCircle2 className="h-3 w-3 text-primary/40 ml-1 shrink-0" />
        )}
      </div>

      {isOpen && hasChildren && (
        <div className="relative">
          {/* Visual line connector */}
          <div
            className="absolute left-3 top-0 bottom-2 w-px bg-white/5 z-0"
            style={{ marginLeft: `${level * 12 + 6}px` }}
          />
          <div className="relative z-10">
            {folder.children.map((child: any, idx: number) => (
              <FolderNode
                key={`${idx}-${child.name}`}
                folder={child}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
