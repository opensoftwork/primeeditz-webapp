"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/modules/projects/detail/shared";

interface ProjectHeaderProps {
  code: string;
  status: string;
}

export function ProjectHeader({ code, status }: ProjectHeaderProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button
          variant="ghost"
          asChild
          className="mb-4 -ml-4 hover:bg-white/5 gap-2 group"
        >
          <Link href="/projects">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            BACK TO PROJECTS
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
            {code}
          </h1>
          <StatusBadge status={status} />
        </div>
      </motion.div>

      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Button
          className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[11px] bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20"
          disabled={status !== "pending_review"}
        >
          CREATE QUOTATION
        </Button>
        <Button
          variant="outline"
          className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[11px] border-white/10 hover:bg-white/5 text-white/60 hover:text-white"
        >
          UPDATE STATUS
        </Button>
      </motion.div>
    </div>
  );
}
