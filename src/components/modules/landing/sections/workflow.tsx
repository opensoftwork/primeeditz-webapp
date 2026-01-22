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
}

// --- Data ---

const workflowSteps: WorkflowStep[] = [
  {
    id: 1,
    icon: FileEdit,
    title: "Request",
    description: "Submit project requirements"
  },
  {
    id: 2,
    icon: Receipt,
    title: "Quote",
    description: "Receive custom quotation"
  },
  {
    id: 3,
    icon: CheckCircle,
    title: "Approve",
    description: "Review & approve quote"
  },
  {
    id: 4,
    icon: Upload,
    title: "Upload",
    description: "Upload your raw assets"
  },
  {
    id: 5,
    icon: Wand2,
    title: "Edit",
    description: "Our team works their magic"
  },
  {
    id: 6,
    icon: Download,
    title: "Deliver",
    description: "Download final files"
  }
];

// --- Sub-Components ---

function StepItem({ step, index, total }: { step: WorkflowStep; index: number; total: number }) {
  const isLast = index === total - 1;

  return (
    <div className="relative flex flex-col items-center md:flex-row md:items-start group md:flex-1">
      
      {/* Connector Lines */}
      {/* Mobile: Vertical Line */}
      {!isLast && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[2px] h-[calc(100%+2rem)] bg-white/10 md:hidden block" />
      )}
      
      {/* Desktop: Horizontal Line */}
      {!isLast && (
        <div className="absolute top-6 left-1/2 w-full h-[2px] bg-white/10 hidden md:block" />
      )}

      {/* Step Content Wrapper */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="relative z-10 flex flex-col items-center gap-4 w-full"
      >
        
        {/* Circle Number & Icon */}
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20",
          "border-4 border-background z-20 transition-transform duration-300 group-hover:scale-110"
        )}>
          {/* We can show number or icon here. Design spec says: 
              Step number in a circle... Icon below the number.
              Let's put number in circle, icon below.
          */}
          {step.id}
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center text-center gap-1 md:px-2 pb-12 md:pb-0">
           {/* Icon Display */}
           <div className="mb-2 p-2 rounded-lg bg-white/5 text-primary group-hover:text-white transition-colors">
            <step.icon className="w-5 h-5" />
          </div>

          <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
          <p className="text-sm text-muted-foreground max-w-[140px] leading-relaxed">
            {step.description}
          </p>
        </div>

      </motion.div>
    </div>
  );
}

// --- Main Component ---

export function WorkflowDemoSection() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-background border-y border-white/5">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto flex flex-col gap-16">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
           <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase font-black tracking-[0.3em] text-primary"
          >
            How It Works
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold"
          >
            From Request to Delivery
          </motion.h2>
           <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl"
          >
           Six simple steps to get your project done efficiently.
          </motion.p>
        </div>

        {/* Steps Container */}
        <div className="flex flex-col md:flex-row md:justify-between relative mt-8">
            {workflowSteps.map((step, index) => (
              <StepItem 
                key={step.id} 
                step={step} 
                index={index}
                total={workflowSteps.length}
              />
            ))}
        </div>

      </div>
    </section>
  );
}
