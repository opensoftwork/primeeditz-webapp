"use client";

import { FolderTree as FolderTreeComponent } from "@/components/modules/admin/folder-templates/builder/folder-tree";
import { useProjectTypeWizard } from "../wizard-context";
import { FolderOpen, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { FolderLevel1, FolderLevel2, FolderLevel3 } from "@convex/schema";
import { useMemo } from "react";
import { toast } from "sonner";

export function Step2Folders() {
  const { folders, setFolders, step1Data } = useProjectTypeWizard();

  // Calculate folder statistics
  const folderStats = useMemo(() => calculateFolderStats(folders), [folders]);

  // Folder Operations
  const addRootFolder = () => {
    if (folders.length >= 10) {
      toast.error("Maximum 10 root folders allowed");
      return;
    }
    const newRoot: FolderLevel1 = {
      name: "New Folder",
      path: "/new-folder",
      description: "",
      isRequired: false,
      children: [],
    };
    setFolders([...folders, newRoot]);
  };

  const addChildFolder = (path: string) => {
    const newFolders = JSON.parse(JSON.stringify(folders)) as FolderLevel1[];
    const parts = path.split(".");

    try {
      if (parts.length === 1) {
        // Level 1 -> Level 2
        const l1Idx = parseInt(parts[0]);
        const l1 = newFolders[l1Idx];
        if (!l1.children) l1.children = [];
        if (l1.children.length >= 10) {
          toast.error("Maximum 10 folders per level allowed");
          return;
        }

        l1.children.push({
          name: "New Child Folder",
          path: `${l1.path}/new-child`,
          isRequired: false,
          children: [],
        });
      } else if (parts.length === 3) {
        // Level 2 -> Level 3
        const l1Idx = parseInt(parts[0]);
        const l2Idx = parseInt(parts[2]);
        const l2 = newFolders[l1Idx].children![l2Idx];
        if (!l2.children) l2.children = [];
        if (l2.children.length >= 10) {
          toast.error("Maximum 10 folders per level allowed");
          return;
        }

        l2.children.push({
          name: "New Sub-child Folder",
          path: `${l2.path}/new-subchild`,
          isRequired: false,
        });
      }
      setFolders(newFolders);
    } catch (error) {
      console.error("Add child error:", error);
      toast.error("Failed to add folder");
    }
  };

  const updateFolder = (
    path: string,
    updated: FolderLevel1 | FolderLevel2 | FolderLevel3,
  ) => {
    const newFolders = JSON.parse(JSON.stringify(folders)) as FolderLevel1[];
    const parts = path.split(".");

    try {
      if (parts.length === 1) {
        newFolders[parseInt(parts[0])] = {
          ...newFolders[parseInt(parts[0])],
          ...updated,
        } as FolderLevel1;
      } else if (parts.length === 3) {
        const l1Idx = parseInt(parts[0]);
        const l2Idx = parseInt(parts[2]);
        newFolders[l1Idx].children![l2Idx] = {
          ...newFolders[l1Idx].children![l2Idx],
          ...updated,
        } as FolderLevel2;
      } else if (parts.length === 5) {
        const l1Idx = parseInt(parts[0]);
        const l2Idx = parseInt(parts[2]);
        const l3Idx = parseInt(parts[4]);
        newFolders[l1Idx].children![l2Idx].children![l3Idx] = {
          ...newFolders[l1Idx].children![l2Idx].children![l3Idx],
          ...updated,
        } as FolderLevel3;
      }
      setFolders(newFolders);
    } catch (error) {
      console.error("Update folder error:", error);
      toast.error("Failed to update folder");
    }
  };

  const deleteFolder = (path: string) => {
    const newFolders = JSON.parse(JSON.stringify(folders)) as FolderLevel1[];
    const parts = path.split(".");

    try {
      if (parts.length === 1) {
        newFolders.splice(parseInt(parts[0]), 1);
      } else if (parts.length === 3) {
        const l1Idx = parseInt(parts[0]);
        newFolders[l1Idx].children!.splice(parseInt(parts[2]), 1);
      } else if (parts.length === 5) {
        const l1Idx = parseInt(parts[0]);
        const l2Idx = parseInt(parts[2]);
        newFolders[l1Idx].children![l2Idx].children!.splice(
          parseInt(parts[4]),
          1,
        );
      }
      setFolders(newFolders);
    } catch (error) {
      console.error("Delete folder error:", error);
      toast.error("Failed to delete folder");
    }
  };

  const deleteBulk = (paths: string[]) => {
    const newFolders = JSON.parse(JSON.stringify(folders)) as FolderLevel1[];

    // Sort paths in reverse order to avoid index shifting problems
    // Longer paths first (L3 -> L2 -> L1)
    const sortedPaths = [...paths].sort((a, b) => {
      const aParts = a.split(".");
      const bParts = b.split(".");

      // Sort by depth (more parts first)
      if (aParts.length !== bParts.length) {
        return bParts.length - aParts.length;
      }

      // For same depth, sort by index descending
      return (
        parseInt(bParts[bParts.length - 1]) -
        parseInt(aParts[aParts.length - 1])
      );
    });

    try {
      sortedPaths.forEach((path) => {
        const parts = path.split(".");
        if (parts.length === 1) {
          newFolders.splice(parseInt(parts[0]), 1);
        } else if (parts.length === 3) {
          const l1Idx = parseInt(parts[0]);
          newFolders[l1Idx].children!.splice(parseInt(parts[2]), 1);
        } else if (parts.length === 5) {
          const l1Idx = parseInt(parts[0]);
          const l2Idx = parseInt(parts[2]);
          newFolders[l1Idx].children![l2Idx].children!.splice(
            parseInt(parts[4]),
            1,
          );
        }
      });
      setFolders(newFolders);
      toast.success(`Deleted ${paths.length} folders`);
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete selected folders");
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Step Header - Compact */}
      <div className="shrink-0 flex items-center justify-between pb-4">
        <div className="flex items-center gap-4">
          <div className="h-1 w-10 rounded-full bg-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            Step 02
          </span>
          <h2 className="text-xl font-black uppercase tracking-tight text-white">
            Folder Hierarchy
          </h2>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
            Max 3 levels • 10 per level
          </span>
        </div>
      </div>

      {/* Validation Warning */}
      {folders.length === 0 && (
        <Alert className="shrink-0 mb-4 bg-amber-500/10 border-amber-500/20 text-amber-400 rounded-xl border-dashed">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-[10px] font-black uppercase tracking-widest ml-2">
            At least one folder is required to proceed.
          </AlertDescription>
        </Alert>
      )}

      {/* Folder Stats - Inline with header style */}
      {folders.length > 0 && (
        <div className="shrink-0 flex items-center gap-3 mb-4 px-4 py-3 rounded-xl bg-white/3 border border-white/5">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <FolderOpen className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-black text-white uppercase tracking-tight">
              {folderStats.total} Folders Configured
            </p>
            <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold">
              Organized across {folderStats.levels} levels
            </p>
          </div>
        </div>
      )}

      {/* Folder Tree - Takes remaining space */}
      <div className="flex-1 min-h-0 bg-zinc-950/30 rounded-2xl border border-white/5 p-4 overflow-y-auto custom-scrollbar">
        <FolderTreeComponent
          folders={folders}
          onAddRoot={addRootFolder}
          onAddChild={addChildFolder}
          onEdit={updateFolder}
          onDelete={deleteFolder}
          onDeleteBulk={deleteBulk}
        />
      </div>
    </div>
  );
}

// Helper function
function calculateFolderStats(folders: FolderLevel1[]) {
  let total = 0;
  let maxDepth = 0;

  function countFolders(items: any[], depth: number) {
    if (!items) return;
    total += items.length;
    maxDepth = Math.max(maxDepth, depth);
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        countFolders(item.children, depth + 1);
      }
    });
  }

  if (folders && folders.length > 0) {
    countFolders(folders, 1);
  }

  return { total, levels: maxDepth };
}
