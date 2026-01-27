"use client";

import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/modules/projects/detail/shared";
import { Button } from "@/components/ui/button";

interface ProjectHeaderProps {
  code: string;
  phase: string;
  actionState: string;
  deliveryLabel?: string;
  onUpdateStatus?: () => void;
}

export function ProjectHeader({
  code,
  phase,
  actionState,
  deliveryLabel,
  onUpdateStatus,
}: ProjectHeaderProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 -ml-4 hover:bg-white/5 gap-2 group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          BACK TO PROJECTS
        </Button>
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
            {code}
          </h1>
          <StatusBadge
            status={actionState}
            phase={phase}
            showPhase={true}
            deliveryLabel={deliveryLabel}
          />
        </div>
      </motion.div>

      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Button
          variant="outline"
          className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[11px] border-white/10 hover:bg-white/5 text-white/60 hover:text-white"
          onClick={onUpdateStatus}
        >
          UPDATE STATUS
        </Button>
      </motion.div>
    </div>
  );
}
