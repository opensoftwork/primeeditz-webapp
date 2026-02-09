"use client";

import {
  Folder,
  Trash2,
  UploadCloud,
  CheckCircle2,
  Circle,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import type { FolderLevel1, FolderLevel2, FolderLevel3 } from "@convex/schema";

interface FolderNodeProps {
  folder: FolderLevel1 | FolderLevel2 | FolderLevel3;
  level: 1 | 2 | 3;
  path: string; // Internal unique ID for editing/deleting
  onAddChild?: (parentPath: string) => void;
  onEdit: (
    path: string,
    folder: FolderLevel1 | FolderLevel2 | FolderLevel3,
  ) => void;
  onDelete: (path: string) => void;
  onOpen?: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
  readOnly?: boolean;
}

export function FolderNode({
  folder,
  level,
  path,
  onAddChild,
  onEdit,
  onDelete,
  onOpen,
  isSelected,
  onSelect,
  readOnly = false,
}: FolderNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditName(folder.name);
  }, [folder.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNameSave = () => {
    if (editName.trim() && editName !== folder.name) {
      const slug = editName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      onEdit(path, {
        ...folder,
        name: editName.trim(),
        path: `/${slug}`,
      });
    } else {
      setEditName(folder.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave();
    } else if (e.key === "Escape") {
      setEditName(folder.name);
      setIsEditing(false);
    }
  };

  const handleToggleRequired = (checked: boolean) => {
    onEdit(path, { ...folder, isRequired: checked });
  };

  return (
    <div
      onDoubleClick={onOpen}
      onClick={(e) => {
        if (onSelect) {
          e.stopPropagation();
          onSelect();
        }
      }}
      className={cn(
        "group relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all border cursor-pointer aspect-square text-center",
        isSelected
          ? "bg-primary/10 border-primary/50 ring-1 ring-primary/20"
          : "bg-white/2 border-white/20 hover:border-primary/40 hover:bg-white/5",
        isEditing && "ring-2 ring-primary/50",
      )}
    >
      {/* Selection Indicator */}
      {!readOnly && (
        <div
          className={cn(
            "absolute top-2.5 left-2.5 h-4 w-4 rounded-full flex items-center justify-center transition-all duration-200",
            isSelected
              ? "bg-primary text-white scale-110"
              : "bg-white/5 text-white/20 opacity-0 group-hover:opacity-100 hover:bg-white/10",
          )}
        >
          {isSelected ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <Circle className="h-3 w-3" />
          )}
        </div>
      )}

      {/* Required Indicator */}
      <div className="absolute top-2.5 left-8 flex items-center gap-2">
        <div
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            folder.isRequired
              ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"
              : "bg-white/10",
          )}
          title={folder.isRequired ? "Upload Required" : "Optional"}
        />
      </div>

      {/* Folder Icon */}
      <div
        className={cn(
          "flex items-center justify-center rounded-xl transition-all mb-2 shrink-0 shadow-xl",
          level === 1
            ? "h-12 w-12 bg-primary/10 text-primary group-hover:scale-110"
            : "h-10 w-10 bg-white/5 text-white/40 group-hover:text-white/60 group-hover:scale-110",
          isSelected && "text-primary bg-primary/20",
        )}
      >
        <Folder
          className={cn("transition-all", level === 1 ? "h-6 w-6" : "h-5 w-5")}
        />
      </div>

      {/* Folder Info */}
      <div className="flex flex-col items-center w-full px-2 overflow-hidden">
        {isEditing ? (
          <Input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="h-8 py-0 px-2 bg-zinc-950 border-primary/50 text-xs font-bold text-center focus-visible:ring-1 focus-visible:ring-primary/30 rounded-lg w-full"
          />
        ) : (
          <span
            className={cn(
              "text-white/90 transition-colors group-hover:text-white font-bold leading-tight truncate w-full px-2 py-1",
              level === 1 ? "text-xs tracking-wide uppercase" : "text-xs",
            )}
            title={folder.name}
          >
            {folder.name}
          </span>
        )}
        {folder.description && (
          <span className="text-[10px] text-white/30 font-medium line-clamp-1 mt-1 px-4">
            {folder.description}
          </span>
        )}
      </div>

      {!readOnly && (
        <div className="absolute top-3 right-3 flex flex-col items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-all z-20">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg bg-zinc-950/80 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:text-white transition-all shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg bg-zinc-950/80 backdrop-blur-md border border-white/10 hover:bg-red-500 hover:text-white transition-all shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(path);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <div
            className="h-8 w-8 rounded-lg bg-zinc-950/80 backdrop-blur-md border border-white/10 flex items-center justify-center cursor-pointer hover:bg-primary transition-all shadow-lg group/upload"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleRequired(!folder.isRequired);
            }}
          >
            <UploadCloud
              className={cn(
                "h-3.5 w-3.5 transition-colors",
                folder.isRequired
                  ? "text-primary group-hover/upload:text-white"
                  : "text-white/20",
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
