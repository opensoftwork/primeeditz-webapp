"use client";

import {
  ArrowRight,
  Clock,
  FileText,
  FolderOpen,
  type LucideIcon,
  MessageSquare,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// --- Types ---

interface ProblemSolutionPair {
  problem: string;
  icon: LucideIcon;
  solution: string;
  color: string;
}

// --- Data ---

const problemSolutionData: ProblemSolutionPair[] = [
  {
    problem: "Scattered Communication",
    icon: MessageSquare,
    solution: "Unified request portal",
    color: "text-blue-400",
  },
  {
    problem: "File Chaos",
    icon: FolderOpen,
    solution: "Organized folder structure",
    color: "text-amber-400",
  },
  {
    problem: "Status Anxiety",
    icon: Clock,
    solution: "Real-time progress tracking",
    color: "text-emerald-400",
  },
  {
    problem: "Manual Quotations",
    icon: FileText,
    solution: "Template-based instant quotes",
    color: "text-purple-400",
  },
  {
    problem: "No Accountability",
    icon: Shield,
    solution: "Complete audit trail",
    color: "text-rose-400",
  },
];

// --- Sub-Components ---

function ProblemSolutionCard({
  item,
  index,
}: {
  item: ProblemSolutionPair;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "relative flex flex-col items-center justify-between p-6 gap-4",
        "bg-background/60 backdrop-blur-md border border-white/5 rounded-3xl",
        "hover:bg-background/80 hover:border-white/10 transition-colors duration-300",
        "group h-full min-h-[220px]",
      )}
    >
      {/* Problem Section (Top) */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            "bg-white/5 border border-white/5",
            "group-hover:scale-110 transition-transform duration-300",
          )}
        >
          <item.icon className={cn("w-6 h-6", item.color)} />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">
          {item.problem}
        </h3>
      </div>

      {/* Transition Arrow */}
      <div className="flex flex-col items-center text-white/20">
        <ArrowRight className="w-5 h-5 rotate-90 lg:rotate-0" />
      </div>

      {/* Solution Section (Bottom) */}
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-base font-semibold bg-clip-text text-transparent bg-linear-to-b from-white to-white/80">
          {item.solution}
        </span>
      </div>

      {/* Glow Effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          "bg-linear-to-b from-white/5 to-transparent pointer-events-none",
        )}
      />
    </motion.div>
  );
}

// --- Main Component ---

export function ProblemSolutionSection() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto flex flex-col gap-16">
        {/* Section Heading */}
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              "inline-flex items-center justify-center",
              "px-4 py-2",
              "text-[10px] uppercase font-black tracking-[0.3em]",
              "text-cyan-400",
              "rounded-full",
              "bg-white/10",
              "backdrop-blur-md",
              "border border-white/20",
              "shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
            )}
          >
            The Chaos We Fix
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white"
          >
            From Friction to Flow
          </motion.h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {problemSolutionData.map((item, index) => (
            <ProblemSolutionCard key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
