"use client";

import { ArrowLeft, HardDrive, Home, Image } from "lucide-react";
import { useMemo, useState } from "react";
import { FolderCard, formatBytes } from "./folder-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Folder {
  _id: string;
  name: string;
  path: string;
  status: string;
  assetCount?: number;
  totalSize?: number;
  [key: string]: any;
}

interface FolderGridProps {
  folders: Folder[] | undefined;
  onFolderClick?: (folder: Folder) => void;
  title?: string;
  showStats?: boolean;
  isLocked?: boolean;
  onFolderComplete?: (folder: Folder) => void;
  showViewModeHint?: boolean;
}

/**
 * Hierarchical folder grid that displays folders at the current navigation level.
 * Click a folder to navigate into it and see its children.
 */
export function FolderGrid({
  folders,
  onFolderClick,
  title = "Project Folders",
  showStats = true,
  isLocked = false,
  onFolderComplete,
  showViewModeHint = false,
}: FolderGridProps) {
  // Current navigation path (e.g., "" for root, "01_FOOTAGE" for inside that folder)
  const [currentPath, setCurrentPath] = useState<string>("");

  // Build hierarchical view from flat folder list
  const { currentFolders, breadcrumbs, hasChildren } = useMemo(() => {
    if (!folders || folders.length === 0) {
      return {
        currentFolders: [],
        breadcrumbs: [],
        hasChildren: new Map<string, boolean>(),
      };
    }

    // Normalize current path by removing potential leading slash for consistent matching
    const normalizedCurrentPath = currentPath.startsWith("/")
      ? currentPath.slice(1)
      : currentPath;

    // Determine which folders are at the current level
    const foldersAtCurrentLevel = folders.filter((folder) => {
      const folderPath = folder.path;

      // Safety check for missing path
      if (typeof folderPath !== "string") return false;

      // Normalize folder path removal leading slash
      const normalizedPath = folderPath.startsWith("/")
        ? folderPath.slice(1)
        : folderPath;

      if (normalizedCurrentPath === "") {
        // Root level: folders without "/" in their normalized path
        return !normalizedPath.includes("/");
      } else {
        // Inside a folder: folders that start with normalizedCurrentPath/ and have no more slashes
        const prefix = normalizedCurrentPath + "/";
        if (!normalizedPath.startsWith(prefix)) return false;
        const remainder = normalizedPath.slice(prefix.length);
        return !remainder.includes("/");
      }
    });

    // Check which folders have children
    const hasChildrenMap = new Map<string, boolean>();
    foldersAtCurrentLevel.forEach((folder) => {
      if (!folder.path) return;

      const folderPath = folder.path;
      const normalizedPath = folderPath.startsWith("/")
        ? folderPath.slice(1)
        : folderPath;

      const childPrefix = normalizedPath + "/";
      const hasChild = folders.some((f) => {
        if (!f.path) return false;
        const normalizedFPath = f.path.startsWith("/")
          ? f.path.slice(1)
          : f.path;
        return normalizedFPath.startsWith(childPrefix);
      });
      hasChildrenMap.set(folder._id, hasChild);
    });

    // Build breadcrumbs
    const crumbs: { label: string; path: string }[] = [
      { label: "Root", path: "" },
    ];
    if (normalizedCurrentPath) {
      const parts = normalizedCurrentPath.split("/");
      let accumulatedPath = "";
      parts.forEach((part) => {
        // Maintain leading slash in accumulated path if original paths had them
        // This ensures navigateTo works correctly with existing folder paths
        const hasLeadingSlash = folders.some((f) => f.path?.startsWith("/"));
        accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;
        const breadcrumbPath =
          hasLeadingSlash && !accumulatedPath.startsWith("/")
            ? `/${accumulatedPath}`
            : accumulatedPath;
        crumbs.push({ label: part, path: breadcrumbPath });
      });
    }

    return {
      currentFolders: foldersAtCurrentLevel,
      breadcrumbs: crumbs,
      hasChildren: hasChildrenMap,
    };
  }, [folders, currentPath]);

  const handleFolderClick = (folder: Folder) => {
    // Check if this folder has children
    if (hasChildren.get(folder._id)) {
      // Navigate into the folder to show children
      setCurrentPath(folder.path);
    } else {
      // Leaf folder - trigger the original onFolderClick (e.g., for upload)
      onFolderClick?.(folder);
    }
  };

  const navigateTo = (path: string) => {
    setCurrentPath(path);
  };

  if (folders === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="p-12 rounded-[2.5rem] border border-dashed border-white/5 flex flex-col items-center justify-center text-center">
        <p className="text-white/20 font-black uppercase tracking-widest text-xs">
          No folders configured for this project
        </p>
      </div>
    );
  }

  const totalAssets = folders.reduce((sum, f) => sum + (f.assetCount || 0), 0);
  const totalSize = folders.reduce((sum, f) => sum + (f.totalSize || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] opacity-40">
          {title || "Folder Structure"}
        </h3>
        {showStats && (
          <div className="flex items-center gap-6 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2">
              <Image className="h-3.5 w-3.5 text-primary/40" />
              {totalAssets} FILES
            </span>
            <span className="flex items-center gap-2">
              <HardDrive className="h-3.5 w-3.5 text-primary/40" />
              {formatBytes(totalSize)}
            </span>
          </div>
        )}
      </div>

      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.path} className="flex items-center gap-2">
              {idx > 0 && <span className="text-white/20 text-xs">/</span>}
              <button
                onClick={() => navigateTo(crumb.path)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  idx === breadcrumbs.length - 1
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5",
                )}
              >
                {idx === 0 && <Home className="h-3 w-3" />}
                {crumb.label}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Back Button (when inside a folder) */}
      {currentPath && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const parentPath = currentPath.includes("/")
              ? currentPath.substring(0, currentPath.lastIndexOf("/"))
              : "";
            setCurrentPath(parentPath);
          }}
          className="h-9 px-4 gap-2 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 rounded-xl"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to previous
        </Button>
      )}

      {/* Folders Grid */}
      {currentFolders.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center text-center">
          <p className="text-white/20 font-bold uppercase tracking-widest text-xs">
            No subfolders at this level
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentFolders.map((folder) => (
            <FolderCard
              key={folder._id}
              id={folder._id}
              name={folder.name}
              status={folder.status}
              assetCount={folder.assetCount || 0}
              totalSize={folder.totalSize || 0}
              isLocked={isLocked}
              isViewOnly={showViewModeHint}
              onClick={() => handleFolderClick(folder)}
              onComplete={() => onFolderComplete?.(folder)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
