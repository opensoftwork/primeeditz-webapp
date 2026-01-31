"use client";

import { FolderNode } from "./folder-node";
import { Button } from "@/components/ui/button";
import {
  Plus,
  LayoutTemplate,
  ChevronRight,
  Home,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import type { FolderLevel1, FolderLevel2, FolderLevel3 } from "@convex/schema";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface FolderTreeProps {
  folders: FolderLevel1[];
  onAddRoot: () => void;
  onAddChild: (parentPath: string) => void;
  onEdit: (
    path: string,
    folder: FolderLevel1 | FolderLevel2 | FolderLevel3,
  ) => void;
  onDelete: (path: string) => void;
  onDeleteBulk: (paths: string[]) => void;
  renderHeader?: React.ReactNode;
}

export function FolderTree({
  folders,
  onAddRoot,
  onAddChild,
  onEdit,
  onDelete,
  onDeleteBulk,
  renderHeader,
}: FolderTreeProps) {
  // Navigation state: array of indices [idx1, idx2]
  const [navPath, setNavPath] = useState<number[]>([]);
  // Selection state: array of full paths
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);

  // Get current directory's contents and name
  const { currentFolders, breadcrumbs, currentLevel, parentPath } =
    useMemo(() => {
      let current: any[] = folders;
      const breads: { name: string; path: number[] }[] = [
        { name: "Root", path: [] },
      ];
      let pathStr = "";

      for (let i = 0; i < navPath.length; i++) {
        const idx = navPath[i];
        const folder = current[idx];
        if (!folder) break;

        breads.push({ name: folder.name, path: navPath.slice(0, i + 1) });

        if (i === 0) {
          pathStr = `${idx}`;
        } else {
          pathStr += `.children.${idx}`;
        }

        current = folder.children || [];
      }

      return {
        currentFolders: current as (
          | FolderLevel1
          | FolderLevel2
          | FolderLevel3
        )[],
        breadcrumbs: breads,
        currentLevel: (navPath.length + 1) as 1 | 2 | 3,
        parentPath: pathStr,
      };
    }, [folders, navPath]);

  const handleOpenFolder = (idx: number) => {
    if (navPath.length < 2) {
      // Max depth is 3 levels
      setNavPath([...navPath, idx]);
    }
  };

  const navigateTo = (path: number[]) => {
    setNavPath(path);
    setSelectedPaths([]); // Clear selection when navigating
  };

  const toggleSelection = (path: string) => {
    setSelectedPaths((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  };

  const handleBulkDelete = () => {
    onDeleteBulk(selectedPaths);
    setSelectedPaths([]);
  };

  const handleAdd = () => {
    if (navPath.length === 0) {
      onAddRoot();
    } else {
      onAddChild(parentPath);
    }
  };

  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      <div className="flex flex-col gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <LayoutTemplate className="h-4 w-4 text-primary" />
              </div>
              <div className="hidden sm:block">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/90 leading-none">
                  Structure
                </h3>
              </div>
            </div>

            {/* Custom Header Injection (Project Type Select) */}
            {navPath.length === 0 && renderHeader}
          </div>
          <div className="flex items-center gap-2">
            {selectedPaths.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleBulkDelete}
                className="h-9 px-4 gap-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all animate-in fade-in zoom-in-95 duration-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete ({selectedPaths.length})
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleAdd}
              disabled={currentFolders.length >= 10}
              className="h-9 px-4 gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="h-3.5 w-3.5" />
              Add {navPath.length === 0 ? "Root " : "Sub-"}Folder
            </Button>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {breadcrumbs.map((bread, i) => (
            <div key={i} className="flex items-center shrink-0">
              {i > 0 && <ChevronRight className="h-3 w-3 mx-1 text-white/20" />}
              <button
                onClick={() => navigateTo(bread.path)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  i === breadcrumbs.length - 1
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/70",
                )}
              >
                {i === 0 && <Home className="h-3 w-3" />}
                {bread.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 min-h-[300px]">
        {/* Navigation & Limit Row */}
        <div className="flex items-center justify-between pb-2">
          {navPath.length > 0 ? (
            <button
              onClick={() => setNavPath(navPath.slice(0, -1))}
              className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-primary uppercase tracking-widest hover:bg-white/5 rounded-lg transition-all w-fit"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to previous
            </button>
          ) : (
            <div /> // Spacer
          )}

          <div className="flex flex-col items-end shrink-0">
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-colors",
                currentFolders.length >= 10 ? "text-red-500" : "text-white/20",
              )}
            >
              {currentFolders.length} / 10
            </span>
            <span className="text-[8px] font-bold text-white/10 uppercase tracking-[0.2em]">
              Directory Limit
            </span>
          </div>
        </div>

        {currentFolders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 border border-white/5 rounded-3xl bg-white/2">
            <div className="p-4 rounded-2xl bg-white/5 mb-4">
              <LayoutTemplate className="h-8 w-8 text-white/20" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">
              Folder Empty
            </h3>
            <p className="text-xs text-white/30 font-medium mb-4">
              No {navPath.length === 0 ? "root" : "child"} folders found
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdd}
              className="bg-white/5 border-white/5 hover:bg-white/10 hover:text-white text-white/60 font-bold uppercase tracking-widest text-[10px] h-9 px-6 rounded-xl transition-all"
            >
              Create First Folder
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {currentFolders.map((folder, idx) => {
              const fullPath =
                navPath.length === 0
                  ? `${idx}`
                  : `${parentPath}.children.${idx}`;

              return (
                <FolderNode
                  key={`${fullPath}-${folder.name}`}
                  folder={folder}
                  level={currentLevel}
                  path={fullPath}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onOpen={() => handleOpenFolder(idx)}
                  isSelected={selectedPaths.includes(fullPath)}
                  onSelect={() => toggleSelection(fullPath)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
