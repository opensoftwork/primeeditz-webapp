"use client";

import { motion } from "motion/react";
import { 
  User, 
  Palette, 
  BarChart3, 
  Settings, 
  Check, 
  ArrowRight,
  LucideIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

interface PortalFeature {
  name: string;
  icon: LucideIcon;
  color: string;
  glowColor: string;
  features: string[];
}

// --- Data ---

const portalData: PortalFeature[] = [
  {
    name: "Client",
    icon: User,
    color: "text-cyan-400",
    glowColor: "shadow-cyan-400/20",
    features: [
      "Request new projects",
      "Upload raw assets",
      "Track real-time progress",
      "One-click approvals"
    ]
  },
  {
    name: "Employee",
    icon: Palette,
    color: "text-emerald-400",
    glowColor: "shadow-emerald-400/20",
    features: [
      "Personalized task board",
      "Edit & update status",
      "Submit deliverables",
      "Internal project notes"
    ]
  },
  {
    name: "Admin",
    icon: BarChart3,
    color: "text-amber-400",
    glowColor: "shadow-amber-400/20",
    features: [
      "Global project oversight",
      "Assign tasks to team",
      "Review deliverables",
      "Performance reports"
    ]
  },
  {
    name: "SuperAdmin",
    icon: Settings,
    color: "text-purple-400",
    glowColor: "shadow-purple-400/20",
    features: [
      "System configurations",
      "Manage templates",
      "Setup pricing tiers",
      "User role management"
    ]
  }
];

// --- Sub-Components ---

function PortalCard({ feature, index }: { feature: PortalFeature; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "group relative flex flex-col p-8 rounded-3xl",
        "bg-white/2 border border-white/5 backdrop-blur-sm",
        "hover:translate-y-[-4px] transition-all duration-300 ease-out",
        "hover:bg-white/4 hover:border-white/10",
        "hover:shadow-2xl hover:shadow-black/50"
      )}
    >
      {/* Icon Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center",
          "bg-white/5 border border-white/5",
          "group-hover:scale-110 transition-transform duration-300",
          feature.color,
          "shadow-lg", 
          feature.glowColor
        )}>
          <feature.icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-white/70">
          {feature.name}
        </h3>
      </div>

      {/* Feature List */}
      <ul className="flex flex-col gap-3 mb-8 grow">
        {feature.features.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">
            <Check className={cn("w-4 h-4 mt-0.5", feature.color)} />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* Learn More Link */}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
        <span className={cn(feature.color)}>Learn more</span>
        <ArrowRight className={cn("w-3 h-3 transition-transform group-hover:translate-x-1", feature.color)} />
      </div>

      {/* Subtle Gradient Overlay */}
      <div className={cn(
        "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none",
        "bg-linear-to-b from-white/5 to-transparent"
      )} />
    </motion.div>
  );
}

// --- Main Component ---

export function FeaturesShowcaseSection() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-black/20">
      <div className="relative max-w-7xl mx-auto flex flex-col gap-16">
        
        {/* Section Heading */}
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase font-black tracking-[0.3em] text-white/60"
          >
            One Platform, Four Experiences
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-b from-white to-white/60"
          >
            Built for Every Role
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl text-lg"
          >
            A cohesive ecosystem that connects clients, editors, and admins in one seamless workflow.
          </motion.p>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portalData.map((feature, index) => (
            <PortalCard 
              key={index} 
              feature={feature} 
              index={index} 
            />
          ))}
        </div>

      </div>
    </section>
  );
}
