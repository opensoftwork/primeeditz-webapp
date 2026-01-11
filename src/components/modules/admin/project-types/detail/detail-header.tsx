"use client";

import { motion } from "motion/react";
import { ArrowLeft, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DetailHeaderProps {
  id: string;
  projectType: {
    name: string;
    categoryName: string;
  };
  onAddField: () => void;
}

export function DetailHeader({
  id,
  projectType,
  onAddField,
}: DetailHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10"
        >
          <Link href="/settings/project-types">
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </Link>
        </Button>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-0.5 rounded">
              Configuration
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              / {projectType.categoryName}
            </span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            {projectType.name}
          </h1>
        </motion.div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          asChild
          className="h-11 border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white font-bold uppercase tracking-widest text-[10px]"
        >
          <Link href={`/settings/project-types/${id}/preview`}>
            <Eye className="mr-2 h-4 w-4" />
            Preview Form
          </Link>
        </Button>
        <Button
          onClick={onAddField}
          className="h-11 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] px-6"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Field
        </Button>
      </div>
    </div>
  );
}
