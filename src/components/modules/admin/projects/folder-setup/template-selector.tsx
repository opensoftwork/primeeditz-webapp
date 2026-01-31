"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { CheckCircle, Circle, FolderIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderTemplate {
  _id: Id<"folderTemplates">;
  name: string;
  folders: string[];
  projectTypeName?: string;
  isDefault?: boolean;
}

interface TemplateSelectorProps {
  projectTypeId: Id<"projectTypes">;
  selectedTemplateId: Id<"folderTemplates"> | null;
  onSelect: (template: FolderTemplate) => void;
}

export function TemplateSelector({
  projectTypeId,
  selectedTemplateId,
  onSelect,
}: TemplateSelectorProps) {
  const templates = useQuery(
    api.functions.folderTemplates.queries.listByProjectType,
    { projectTypeId },
  );

  if (templates === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-white/20" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-8 px-4 rounded-xl bg-white/3 border border-white/5">
        <FolderIcon className="h-8 w-8 text-white/20 mx-auto mb-3" />
        <p className="text-white/40 text-sm font-medium">
          No folder templates available
        </p>
        <p className="text-white/20 text-xs mt-1">
          Create a folder template first in Admin Settings
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {templates.map((template) => (
        <button
          key={template._id}
          type="button"
          onClick={() => onSelect(template)}
          className={cn(
            "w-full text-left p-4 rounded-xl border transition-all duration-200",
            selectedTemplateId === template._id
              ? "bg-primary/10 border-primary/30 ring-2 ring-primary/20"
              : "bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10",
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "mt-0.5 p-2 rounded-lg transition-colors",
                selectedTemplateId === template._id
                  ? "bg-primary/20"
                  : "bg-white/5",
              )}
            >
              {selectedTemplateId === template._id ? (
                <CheckCircle className="h-4 w-4 text-primary" />
              ) : (
                <Circle className="h-4 w-4 text-white/20" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-white font-bold text-sm truncate">
                  {template.name}
                </h4>
                {template.isDefault && (
                  <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-primary/20 text-primary rounded">
                    Default
                  </span>
                )}
              </div>
              <p className="text-white/30 text-xs font-medium mt-1">
                {template.folders.length} folders
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {template.folders.slice(0, 4).map((folder, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-[10px] font-bold text-white/50 bg-white/5 rounded-full"
                  >
                    {folder}
                  </span>
                ))}
                {template.folders.length > 4 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-white/30 bg-white/5 rounded-full">
                    +{template.folders.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
