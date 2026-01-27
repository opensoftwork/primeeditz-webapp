"use client";

import {
  CheckCircle,
  Download,
  FileEdit,
  type LucideIcon,
  Receipt,
  Upload,
  Wand2,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// --- Types ---

interface WorkflowStep {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

// --- Data ---

const workflowSteps: WorkflowStep[] = [
  {
    id: 1,
    icon: FileEdit,
    title: "Request",
    description: "Submit detailed requirements via our unified portal.",
    color: "text-blue-400",
  },
  {
    id: 2,
    icon: Receipt,
    title: "Quote",
    description: "Receive a transparent, itemized quotation instantly.",
    color: "text-purple-400",
  },
  {
    id: 3,
    icon: CheckCircle,
    title: "Approve",
    description: "One-click approval to kickstart the creative process.",
    color: "text-green-400",
  },
  {
    id: 4,
    icon: Upload,
    title: "Upload",
    description: "Secure, high-speed upload for your raw assets.",
    color: "text-orange-400",
  },
  {
    id: 5,
    icon: Wand2,
    title: "Edit",
    description: "Our expert editors work their magic on your footage.",
    color: "text-pink-400",
  },
  {
    id: 6,
    icon: Download,
    title: "Deliver",
    description: "Preview and download your polished final assets.",
    color: "text-cyan-400",
  },
];

// --- Sub-Components ---

function WorkflowCard({
  step,
  isLeft,
}: {
  step: WorkflowStep;
  isLeft: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "relative flex-1 group flex flex-col",
        isLeft ? "text-right items-end pr-4" : "text-left items-start pl-4",
      )}
    >
      <div
        className={cn(
          "relative p-5 rounded-2xl w-full max-w-[340px]",
          "bg-white/2 backdrop-blur-md border border-white/5",
          "shadow-xl shadow-black/20",
          "transition-all duration-300 ease-out",
          "group-hover:bg-white/5 group-hover:border-white/10 group-hover:translate-y-[-2px]",
        )}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-2">
          <div
            className={cn(
              "flex items-center gap-2",
              isLeft && "flex-row-reverse",
            )}
          >
            <div className={cn("p-2 rounded-lg bg-white/5", step.color)}>
              <step.icon className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white">
              {step.title}
            </h3>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function TimelineNode({
  step,
  isLast,
}: {
  step: WorkflowStep;
  isLast: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute top-10 -bottom-12 w-px bg-linear-to-b from-white/10 to-transparent" />
      )}

      {/* Node */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="relative z-20"
      >
        {/* Node Core */}
        <div
          className={cn(
            "relative w-3 h-3 rounded-full bg-background border-2 border-white/20",
            "group-hover:border-white/40 group-hover:scale-110 transition-all duration-300",
          )}
        />
      </motion.div>
    </div>
  );
}

// --- Main Component ---

export function WorkflowDemoSection() {
  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative max-w-full mx-auto">
        <div className="backdrop-blur-sm bg-background/5 border border-white/10 shadow-2xl rounded-3xl p-8 md:p-16">
          <div className="flex flex-col gap-16">
            {/* Header */}
            <div className="flex flex-col items-center gap-4 text-center z-10">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[10px] uppercase font-black tracking-[0.3em] text-cyan-400"
              >
                Efficiency Redefined
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white"
              >
                The Prime Flow
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-base max-w-xl mx-auto underline italic"
              >
                Six steps to perfection. A seamless journey from raw footage to
                cinematic masterpiece.
              </motion.p>
            </div>

            {/* Vertical Timeline */}
            <div className="relative flex flex-col gap-12 md:gap-0">
              {/* Central Line Graphic (Desktop only) */}
              <div className="absolute left-4 md:left-1/2 top-4 bottom-0 w-px -translate-x-1/2 bg-linear-to-b from-white/10 via-white/5 to-transparent hidden md:block" />

              {workflowSteps.map((step, index) => {
                const isLeft = index % 2 === 0;
                const isLast = index === workflowSteps.length - 1;

                return (
                  <div
                    key={step.id}
                    className="relative flex flex-row items-center justify-center md:h-36 group"
                  >
                    {/* Desktop Layout */}
                    <div className="hidden md:flex w-full items-center justify-between">
                      {/* Left Side */}
                      <div className="flex-1 flex justify-end">
                        {isLeft && <WorkflowCard step={step} isLeft={true} />}
                      </div>

                      {/* Center Node */}
                      <div className="relative flex-none w-12 flex justify-center">
                        <TimelineNode step={step} isLast={isLast} />

                        {/* Horizontal Connector */}
                        <motion.div
                          initial={{ scaleX: 0, opacity: 0 }}
                          whileInView={{ scaleX: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2, duration: 0.4 }}
                          className={cn(
                            "absolute top-1/2 h-px w-4 bg-white/10",
                            isLeft
                              ? "right-1/2 translate-x-[-4px]"
                              : "left-1/2 translate-x-[4px]",
                          )}
                        />
                      </div>

                      {/* Right Side */}
                      <div className="flex-1 flex justify-start">
                        {!isLeft && <WorkflowCard step={step} isLeft={false} />}
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="flex md:hidden flex-row gap-6 w-full">
                      <div className="flex flex-col items-center">
                        <TimelineNode step={step} isLast={isLast} />
                      </div>
                      <WorkflowCard step={step} isLeft={false} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
