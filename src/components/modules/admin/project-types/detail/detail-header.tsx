"use client";

import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DetailHeaderProps {
  id: string;
  projectType: {
    name: string;
    categoryName: string;
  };
}

export function DetailHeader({ id, projectType }: DetailHeaderProps) {
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
        {/* Simplified View: No action buttons here. Editing is done from the list drawer or a future edit page. */}
      </div>
    </div>
  );
}
