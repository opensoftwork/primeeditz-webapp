"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderTree, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface TemplateCardProps {
  template: {
    _id: string;
    name: string;
    variant?: string;
    folders: any[];
    isActive: boolean;
    _creationTime?: number;
  };
  isDefault: boolean;
  onEdit: () => void;
  onDelete?: () => void;
}

export function TemplateCard({
  template,
  isDefault,
  onEdit,
  onDelete,
}: TemplateCardProps) {
  const folderCount = countFolders(template.folders);
  const createdDate = template._creationTime
    ? new Date(template._creationTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card
        className={cn(
          "relative overflow-hidden bg-white/2 border-white/5 rounded-3xl transition-all hover:bg-white/4 hover:border-white/10 group",
          isDefault && "border-primary/30 bg-primary/5",
        )}
      >
        {/* Glow Effect */}
        <div
          className={cn(
            "absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full translate-x-16 -translate-y-16 transition-colors",
            isDefault
              ? "bg-primary/10 group-hover:bg-primary/20"
              : "bg-white/5 group-hover:bg-white/10",
          )}
        />

        <CardHeader className="relative z-10 flex flex-row items-start justify-between p-6">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2.5 rounded-xl border transition-colors",
                isDefault
                  ? "bg-primary/20 border-primary/30"
                  : "bg-white/5 border-white/10",
              )}
            >
              <FolderTree
                className={cn(
                  "h-5 w-5",
                  isDefault ? "text-primary" : "text-white/40",
                )}
              />
            </div>
            <div>
              <CardTitle className="text-base font-black uppercase tracking-widest text-white">
                {template.name}
              </CardTitle>
              {template.variant && (
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                  {template.variant}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-zinc-900 border-white/10 rounded-xl"
            >
              <DropdownMenuItem onClick={onEdit} className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit Template
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-red-400 focus:text-red-400 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="relative z-10 p-6 pt-0 space-y-4">
          {/* Stats Row */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-white">{folderCount}</p>
              <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">
                Folders
              </p>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex-1 flex items-center gap-2 flex-wrap">
              {isDefault && (
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-black uppercase tracking-widest">
                  Default
                </Badge>
              )}
              {template.isActive ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] font-black uppercase tracking-widest">
                  Active
                </Badge>
              ) : (
                <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30 text-[9px] font-black uppercase tracking-widest">
                  Inactive
                </Badge>
              )}
            </div>
          </div>

          {/* Created Date */}
          {createdDate && (
            <div className="text-[9px] uppercase tracking-widest text-white/30 font-bold">
              Created {createdDate}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function countFolders(folders: any[]): number {
  if (!folders) return 0;
  let count = folders.length;
  folders.forEach((f) => {
    if (f.children) {
      count += countFolders(f.children);
    }
  });
  return count;
}
