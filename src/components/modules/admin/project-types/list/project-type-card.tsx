"use client";

import { Boxes, Edit2, Settings2, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProjectTypeCardProps {
  type: {
    _id: string;
    name: string;
    categoryName: string;
    isActive: boolean;
    fieldCount?: number;
  };
  onEdit: (type: any) => void;
  onToggleStatus: (id: string, current: boolean) => void;
  onDelete: (id: string, name: string) => void;
}

export function ProjectTypeCard({
  type,
  onEdit,
  onToggleStatus,
  onDelete,
}: ProjectTypeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card className="group relative overflow-hidden border-white/5 bg-white/5 backdrop-blur-xl transition-all hover:bg-white/10 rounded-xl">
        {/* Glow Effect */}
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-0" />

        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Boxes className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={type.isActive ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer text-[9px] h-5 px-2 font-black uppercase tracking-widest",
                  type.isActive
                    ? "bg-primary/20 text-primary hover:bg-primary/30"
                    : "bg-white/5 text-white/40 border-white/5",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  onToggleStatus(type._id, type.isActive);
                }}
              >
                {type.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          <div className="mb-3">
            <h3 className="text-base font-black tracking-tight text-white line-clamp-1 uppercase">
              {type.name}
            </h3>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
              {type.categoryName}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-white">
                {String(type.fieldCount || 0).padStart(2, "0")}
              </span>
              <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">
                Fields
              </span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                onClick={() => onEdit(type)}
                title="Edit Basic Info"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10"
                onClick={() => onDelete(type._id, type.name)}
                title="Delete Project Type"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                asChild
                className="h-8 rounded-lg px-3 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20"
              >
                <Link href={`/settings/project-types/${type._id}`}>Config</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
