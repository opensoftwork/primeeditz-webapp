"use client";

import { Layout, FolderTree, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderStructureViewer } from "./folder-structure-viewer";

interface ProjectConfigPreviewProps {
  config: {
    label: string;
    projectTypeId: string;
    folderTemplateId: string;
    defaultStorageTierId?: string;
  };
  projectTypeName?: string;
  folderTemplateName?: string;
  storageTierName?: string;
  folderStructure?: any[];
}

export function ProjectConfigPreview({
  config,
  projectTypeName,
  folderTemplateName,
  storageTierName,
  folderStructure = [],
}: ProjectConfigPreviewProps) {
  return (
    <Card className="bg-white/2 border-white/5 rounded-2xl overflow-hidden glass-subtle transition-all hover:border-primary/20 hover:bg-white/3 group">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layout className="h-3.5 w-3.5 text-primary" />
            </div>
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">
              {config.label || "Project Setup"}
            </h4>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full shadow-none">
            {projectTypeName || "General"}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between group/folder">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/3 flex items-center justify-center border border-white/5">
                <FolderTree className="h-4 w-4 text-white/40" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block">
                  Folder Hierarchy
                </span>
                <span className="text-xs font-bold text-white/60">
                  {folderTemplateName || "Default Structure"}
                </span>
              </div>
            </div>

            <FolderStructureViewer
              folderStructure={folderStructure}
              templateName={folderTemplateName || "Folder Template"}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/3 flex items-center justify-center border border-white/5">
              <Database className="h-4 w-4 text-white/40" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block">
                Storage Allocation
              </span>
              <span className="text-xs font-bold text-white/60">
                {storageTierName || "Standard Capacity"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
