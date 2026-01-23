"use client";

import { motion } from "motion/react";
import { 
  Camera, 
  Film, 
  User, 
  Sparkles,
  LucideIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

interface AudienceType {
  title: string;
  icon: LucideIcon;
  description: string;
  benefit: string;
  color: string;
}

// --- Data ---

const audienceData: AudienceType[] = [
  {
    title: "Wedding Studios",
    icon: Camera,
    description: "Manage 50+ events per year",
    benefit: "Streamlined client communication",
    color: "text-rose-400"
  },
  {
    title: "Video Agencies",
    icon: Film,
    description: "Corporate & commercial production",
    benefit: "Organized file management",
    color: "text-blue-400"
  },
  {
    title: "Freelancers",
    icon: User,
    description: "Solo photographers & videographers",
    benefit: "Professional client experience",
    color: "text-amber-400"
  }
];

// --- Sub-Components ---

function AudienceCard({ item, index }: { item: AudienceType; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "group relative flex flex-col items-center text-center p-8 rounded-3xl",
        "bg-linear-to-br from-white/5 to-white/1 border border-white/5",
        "hover:from-white/10 hover:to-white/5 hover:border-white/10",
        "transition-all duration-300 ease-out hover:-translate-y-2",
        "shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/40"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "w-20 h-20 rounded-full flex items-center justify-center mb-6",
        "bg-white/5 border border-white/5",
        "group-hover:scale-110 transition-transform duration-300"
      )}>
        <item.icon className={cn("w-10 h-10", item.color)} />
      </div>

      {/* Info */}
      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
      <p className="text-muted-foreground mb-6 min-h-12">
        {item.description}
      </p>

      {/* Divider */}
      <div className="w-full h-px bg-white/10 mb-6" />

      {/* Benefit */}
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Sparkles className="w-4 h-4 fill-primary/20" />
        <span>{item.benefit}</span>
      </div>

      {/* Glow Effect */}
      <div className={cn(
        "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        "bg-linear-to-b from-white/5 to-transparent pointer-events-none"
      )} />
    </motion.div>
  );
}

// --- Main Component ---

export function WhoItsForSection() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Ambience - matches workflow section */}
      <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="backdrop-blur-sm bg-background/5 border border-white/10 shadow-2xl rounded-3xl p-8 md:p-16">
          <div className="flex flex-col gap-16">
            {/* Header */}
            <div className="flex flex-col items-center gap-4 text-center">
              <motion.span 
                 initial={{ opacity: 0, y: 10 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="text-[10px] uppercase font-black tracking-[0.3em] text-cyan-400"
              >
                Built for Creative Professionals
              </motion.span>
              
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.1 }}
                 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white"
              >
                Scales With Your Business
              </motion.h2>
            </div>

            {/* Audience Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {audienceData.map((item, index) => (
                <AudienceCard 
                  key={index} 
                  item={item} 
                  index={index} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
