"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Quote, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// --- Types ---

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  rating: number;
}

// --- Data ---
// Placeholder testimonials for beta

const testimonials: Testimonial[] = [
  {
    quote:
      "PrimeEditz has transformed how we manage our studio. No more WhatsApp chaos!",
    name: "Priya S.",
    role: "Wedding Studio Owner",
    rating: 5,
  },
  {
    quote:
      "Finally, a tool that understands creative studios. The quotation system alone saves us hours.",
    name: "Raj M.",
    role: "Video Production Head",
    rating: 5,
  },
  {
    quote:
      "Our team loves how organized everything is now. Clients are impressed too!",
    name: "Anita K.",
    role: "Freelance Photographer",
    rating: 5,
  },
];

// --- Sub-Components ---

function TestimonialCard({ item, index }: { item: Testimonial; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "group relative flex flex-col p-8 rounded-3xl",
        "bg-white/2 border border-white/5",
        "hover:bg-white/5 hover:border-white/10",
        "transition-all duration-300 backdrop-blur-sm"
      )}
    >
      {/* Quote Icon */}
      <div className="mb-6 opacity-30 text-primary">
        <Quote className="w-8 h-8 rotate-180 fill-current" />
      </div>

      {/* Quote Text */}
      <div className="mb-8 grow">
        <p className="text-lg text-white/90 leading-relaxed italic">
          "{item.quote}"
        </p>
      </div>

      {/* Footer: Rating & Author */}
      <div className="flex flex-col gap-4">
        {/* Stars */}
        <div className="flex gap-1">
          {Array.from({ length: item.rating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
          ))}
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Author */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-white/10 bg-white/5">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {item.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-bold text-white uppercase tracking-wide">
              {item.name}
            </div>
            <div className="text-xs text-muted-foreground">{item.role}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Main Component ---

export function TestimonialsSection() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">


      <div className="relative max-w-7xl mx-auto flex flex-col gap-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase font-black tracking-[0.3em] text-primary"
          >
            Social Proof
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold"
          >
            Trusted by Creative Studios
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl"
          >
            See how PrimeEditz is helping studios streamline their workflow.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <TestimonialCard key={index} item={item} index={index} />
          ))}
        </div>

        {/* Placeholder Note */}
        <div className="text-center">
             <p className="text-xs text-muted-foreground/30 uppercase tracking-widest">
                * Beta Program Feedback
             </p>
        </div>
      </div>
    </section>
  );
}
