"use client";

import { ArrowLeft, HardDrive, Home, Image, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { FolderCard, formatBytes } from "./folder-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FolderGridSkeleton } from "./folder-grid-skeleton";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";

interface Folder {
  _id: string;
  name: string;
  path: string;
  status: string;
  assetCount?: number;
  totalSize?: number;
  projectId: string;
  [key: string]: any;
}

interface FolderGridProps {
  folders: Folder[] | undefined;
  onFolderClick?: (folder: Folder) => void;
  title?: string;
  showStats?: boolean;
  isLocked?: boolean;
  isAdmin?: boolean;
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
  isAdmin = false,
  onFolderComplete,
  showViewModeHint = false,
}: FolderGridProps) {
  const repairFolders = useMutation(
    api.functions.folders.mutations.repairProjectFolders,
  );
  const [isRepairing, setIsRepairing] = useState(false);

  // Current navigation path (e.g., "" for root, "01_FOOTAGE" for inside that folder)
  const [currentPath, setCurrentPath] = useState<string>("");

  // Find the actual folder object for the current path
  const currentFolder = useMemo(() => {
    if (!currentPath || !folders) return null;
    const normalized = currentPath.startsWith("/")
      ? currentPath.slice(1)
      : currentPath;
    return folders.find(
      (f) => (f.path.startsWith("/") ? f.path.slice(1) : f.path) === normalized,
    );
  }, [currentPath, folders]);

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

    // Helper to normalize a folder path for comparison
    const normalizePath = (path: string | undefined) =>
      path ? path.replace(/^\/+|\/+$/g, "") : "";

    // Determine which folders are at the current level
    const foldersAtCurrentLevel = folders.filter((folder) => {
      const folderPath = normalizePath(folder.path);

      if (folderPath === "") return false; // Skip root folder if it somehow exists

      if (normalizedCurrentPath === "") {
        // Root level:
        // A folder is at the root level if its path does not contain a '/'
        // OR if its path contains '/', but no intermediate parent folder exists in the list.
        const parts = folderPath.split("/");
        if (parts.length === 1) return true; // e.g., "A"

        // Check if any intermediate parent exists. If not, this folder is effectively at this level.
        let checkPath = "";
        for (let i = 0; i < parts.length - 1; i++) {
          checkPath = checkPath ? `${checkPath}/${parts[i]}` : parts[i];
          if (folders.some((f) => normalizePath(f.path) === checkPath)) {
            return false; // An intermediate parent exists, so this is not a direct child of root
          }
        }
        return true; // No intermediate parent found, so it's a direct child of root (e.g., "A/B" if "A" doesn't exist)
      } else {
        // Inside a folder:
        // A folder is at this level if its path starts with normalizedCurrentPath/
        // AND the remainder of its path does not contain a '/'
        // OR if it contains '/', but no intermediate parent folder exists in the list.
        const prefix = `${normalizedCurrentPath}/`;
        if (!folderPath.startsWith(prefix)) return false;

        const remainder = folderPath.slice(prefix.length);
        if (!remainder) return false; // This is the current folder itself

        const parts = remainder.split("/");
        if (parts.length === 1) return true; // e.g., "current/A"

        // Check if any intermediate parent exists. If not, this folder is effectively at this level.
        let checkPath = normalizedCurrentPath;
        for (let i = 0; i < parts.length - 1; i++) {
          checkPath = `${checkPath}/${parts[i]}`;
          if (folders.some((f) => normalizePath(f.path) === checkPath)) {
            return false; // An intermediate parent exists, so this is not a direct child
          }
        }
        return true; // No intermediate parent found, so it's a direct child (e.g., "current/A/B" if "current/A" doesn't exist)
      }
    });

    // Check which folders have children
    const hasChildrenMap = new Map<string, boolean>();
    foldersAtCurrentLevel.forEach((folder) => {
      if (!folder.path) return;

      const folderPath = normalizePath(folder.path);
      const childPrefix = `${folderPath}/`;
      const hasChild = folders.some((f) => {
        if (!f.path) return false;
        const normalizedFPath = normalizePath(f.path);
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
    return <FolderGridSkeleton />;
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

  const handleRepair = async () => {
    if (!folders?.[0]?.projectId) return;
    setIsRepairing(true);
    try {
      const result = await repairFolders({
        projectId: folders[0].projectId as any,
      });
      toast.success(`Repaired ${result.repairedCount} folder paths!`);
    } catch (err) {
      toast.error("Failed to repair folders");
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] opacity-40">
          {title || "Folder Structure"}
        </h3>
        <div className="flex items-center gap-6">
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isRepairing}
              onClick={handleRepair}
              className="h-7 px-3 gap-2 text-[8px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 rounded-lg transition-all"
            >
              <Wrench
                className={cn("h-3 w-3", isRepairing && "animate-spin")}
              />
              {isRepairing ? "Repairing..." : "Repair Hierarchy"}
            </Button>
          )}
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
      </div>

      {/* Breadcrumb Navigation & Admin Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
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
      </div>

      {/* Navigation Controls */}
      {currentPath && (
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const parentPath = currentPath.includes("/")
                ? currentPath.substring(0, currentPath.lastIndexOf("/"))
                : "";
              setCurrentPath(parentPath);
            }}
            className="h-9 px-4 gap-2 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 rounded-xl border border-primary/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to previous
          </Button>

          {currentFolder && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFolderClick?.(currentFolder)}
              className="h-9 px-4 gap-2 text-[10px] font-black uppercase tracking-widest bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl transition-all shadow-lg shadow-primary/5"
            >
              <HardDrive className="h-3.5 w-3.5" />
              Open & Upload Files
            </Button>
          )}
        </div>
      )}

      {/* Folders Grid */}
      {currentFolders.length === 0 ? (
        <div className="p-12 rounded-[2.5rem] border border-dashed border-white/5 bg-white/1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-2xl bg-white/5">
            <HardDrive className="h-8 w-8 text-white/10" />
          </div>
          <div className="space-y-1">
            <p className="text-white/40 font-black uppercase tracking-widest text-[10px]">
              No subfolders at this level
            </p>
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
              You can upload files directly to this folder
            </p>
          </div>
          {currentFolder && (
            <Button
              onClick={() => onFolderClick?.(currentFolder)}
              className="mt-2 h-10 px-6 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
            >
              Upload to {currentFolder.name}
            </Button>
          )}
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
              onOpen={() => onFolderClick?.(folder)}
              onComplete={() => onFolderComplete?.(folder)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
