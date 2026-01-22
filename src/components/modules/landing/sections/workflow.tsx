"use client";

import { motion } from "motion/react";
import { 
  FileEdit, 
  Receipt, 
  CheckCircle, 
  Upload, 
  Wand2, 
  Download,
  LucideIcon 
} from "lucide-react";
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
    color: "text-blue-400"
  },
  {
    id: 2,
    icon: Receipt,
    title: "Quote",
    description: "Receive a transparent, itemized quotation instantly.",
    color: "text-purple-400"
  },
  {
    id: 3,
    icon: CheckCircle,
    title: "Approve",
    description: "One-click approval to kickstart the creative process.",
    color: "text-green-400"
  },
  {
    id: 4,
    icon: Upload,
    title: "Upload",
    description: "Secure, high-speed upload for your raw assets.",
    color: "text-orange-400"
  },
  {
    id: 5,
    icon: Wand2,
    title: "Edit",
    description: "Our expert editors work their magic on your footage.",
    color: "text-pink-400"
  },
  {
    id: 6,
    icon: Download,
    title: "Deliver",
    description: "Preview and download your polished final assets.",
    color: "text-cyan-400"
  }
];

// --- Sub-Components ---

function WorkflowCard({ step, isLeft }: { step: WorkflowStep; isLeft: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "relative flex-1 group perspective-1000",
        isLeft ? "text-right items-end pr-8" : "text-left items-start pl-8"
      )}
    >
      <div 
        className={cn(
          "relative p-8 rounded-3xl w-full max-w-md",
          "bg-white/5 backdrop-blur-xl border border-white/10",
          "shadow-2xl shadow-black/50",
          "transition-all duration-500 ease-out",
          "group-hover:bg-white/10 group-hover:border-white/20 group-hover:scale-[1.02]",
          "group-hover:shadow-[0_0_30px_-5px_var(--shadow-color)]"
        )}
        style={{ "--shadow-color": "rgba(255,255,255,0.1)" } as any}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Step Number Background */}
        <div className={cn(
          "absolute -top-6 text-[120px] font-black opacity-5 select-none pointer-events-none transition-transform duration-500 group-hover:scale-110",
          isLeft ? "-right-6" : "-left-6",
          step.color
        )}>
          {step.id}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-4">
          <div className={cn("flex items-center gap-3", isLeft && "flex-row-reverse")}>
            <div className={cn("p-3 rounded-xl bg-white/10", step.color)}>
              <step.icon className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-white">{step.title}</h3>
          </div>
          
          <p className="text-muted-foreground text-lg leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function TimelineNode({ step, isLast }: { step: WorkflowStep; isLast: boolean }) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute top-12 bottom-[-4rem] w-px bg-linear-to-b from-white/20 to-white/5" />
      )}
      
      {/* Glowing Node */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="relative z-20"
      >
        {/* Outer Glow */}
        <div className={cn(
          "absolute inset-0 rounded-full blur-md opacity-50",
          step.color.replace('text-', 'bg-')
        )} />
        
        {/* Core */}
        <div className="relative w-4 h-4 rounded-full bg-background border-2 border-white/50" />
      </motion.div>
    </div>
  );
}

// --- Main Component ---

export function WorkflowDemoSection() {
  return (
    <section className="relative w-full py-32 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto flex flex-col gap-24">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-6 text-center z-10">
           <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm uppercase font-black tracking-[0.3em] text-primary"
          >
            Efficiency Redefined
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight"
          >
            The{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-pink-400">
              Prime Flow
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-xl max-w-2xl"
          >
            Six steps to perfection. A seamless journey from raw footage to cinematic masterpiece.
          </motion.p>
        </div>

        {/* Vertical Timeline */}
        <div className="relative flex flex-col gap-16 md:gap-0">
          
          {/* Central Line Graphic (Desktop only) */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-linear-to-b from-transparent via-white/10 to-transparent hidden md:block" />

          {workflowSteps.map((step, index) => {
            const isLeft = index % 2 === 0;
            const isLast = index === workflowSteps.length - 1;

            return (
              <div key={step.id} className="relative flex flex-row items-center justify-center md:h-48 group">
                
                {/* Desktop Layout */}
                <div className="hidden md:flex w-full items-center justify-between">
                  {/* Left Side */}
                  <div className="flex-1 flex justify-end">
                    {isLeft && <WorkflowCard step={step} isLeft={true} />}
                  </div>

                  {/* Center Node */}
                  <div className="relative flex-none w-24 flex justify-center">
                    <TimelineNode step={step} isLast={isLast} />
                    
                    {/* Horizontal Connector */}
                    <motion.div 
                      initial={{ scaleX: 0, opacity: 0 }}
                      whileInView={{ scaleX: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className={cn(
                        "absolute top-1/2 h-px w-1/2 bg-linear-to-r from-white/20 to-transparent",
                        isLeft ? "right-1/2 origin-right" : "left-1/2 origin-left"
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
    </section>
  );
}
