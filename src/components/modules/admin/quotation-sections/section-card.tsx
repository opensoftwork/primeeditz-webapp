"use client";

import {
  Briefcase,
  Camera,
  Edit2,
  Film,
  GripVertical,
  Hammer,
  type LucideIcon,
  Music,
  Package,
  PenTool,
  Power,
  Trash2,
} from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Section } from "./types";

const ICON_MAP: Record<string, LucideIcon> = {
  Film,
  Hammer,
  PenTool,
  Package,
  Camera,
  Music,
  Briefcase,
};

const COLOR_MAP: Record<string, string> = {
  blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  green: "text-green-500 bg-green-500/10 border-green-500/20",
  amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  red: "text-red-500 bg-red-500/10 border-red-500/20",
  slate: "text-slate-500 bg-slate-500/10 border-slate-500/20",
};

interface SectionCardProps {
  section: Section;
  onEdit: (section: Section) => void;
  onToggleActive: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}

export function SectionCard({
  section,
  onEdit,
  onToggleActive,
  onDelete,
}: SectionCardProps) {
  const Icon = ICON_MAP[section.icon || "Package"] || Package;
  const colorClass = COLOR_MAP[section.color || "blue"];
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={section}
      dragListener={false}
      dragControls={dragControls}
      className="group relative"
    >
      <div
        className={cn(
          "flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 transition-[background-color,border-color,box-shadow,opacity,filter] duration-300 hover:bg-white/8 hover:shadow-xl hover:shadow-black/40",
          !section.isActive && "opacity-60 grayscale",
        )}
      >
        {/* Drag Handle */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="cursor-grab active:cursor-grabbing p-2 text-white/20 group-hover:text-white/40 transition-colors"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Icon & Name */}
        <div
          className={cn(
            "flex items-center justify-center h-12 w-12 rounded-xl border",
            colorClass,
          )}
        >
          <Icon className="h-6 w-6" />
        </div>

        <div className="flex-1">
          <h3 className="text-white font-bold tracking-tight">
            {section.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                section.isActive ? "bg-green-500 animate-pulse" : "bg-white/20",
              )}
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
              {section.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(section)}
            className="h-10 w-10 text-white/40 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <Edit2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleActive(section._id, section.isActive)}
            className={cn(
              "h-10 w-10 rounded-xl",
              section.isActive
                ? "text-amber-500/40 hover:text-amber-500 hover:bg-amber-500/10"
                : "text-green-500/40 hover:text-green-500 hover:bg-green-500/10",
            )}
          >
            <Power className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(section._id)}
            className="h-10 w-10 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Reorder.Item>
  );
}
