"use client";

import { ArrowLeft, Pencil } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Id } from "@convex/_generated/dataModel";

interface DetailHeaderProps {
  packageId: Id<"servicePackages">;
  pkg: {
    name: string;
    categoryName?: string;
  };
}

export function DetailHeader({ packageId, pkg }: DetailHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 shrink-0"
        >
          <Link href="/settings/service-packages">
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </Link>
        </Button>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-0.5 rounded">
              Service Package
            </span>
            {pkg.categoryName && (
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                / {pkg.categoryName}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            {pkg.name}
          </h1>
        </motion.div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          asChild
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-2xl shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Link href={`/settings/service-packages/${packageId}/edit`}>
            Edit Configuration
            <Pencil className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
