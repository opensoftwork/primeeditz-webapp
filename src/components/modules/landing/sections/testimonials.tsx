"use client";

import { Quote, Star } from "lucide-react";
import { motion } from "motion/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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

function TestimonialCard({
  item,
  index,
}: {
  item: Testimonial;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "group relative flex flex-col p-8 rounded-3xl",
        "bg-white/5 border border-white/5 backdrop-blur-md",
        "hover:bg-white/10 hover:border-white/10 hover:translate-y-[-4px]",
        "transition-all duration-500 ease-out shadow-lg shadow-black/20",
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
      {/* Background Ambience - matches other premium sections */}
      <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />{" "}
      <div className="relative max-w-7xl mx-auto flex flex-col gap-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase font-black tracking-[0.3em] text-cyan-400 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-2"
          >
            Social Proof
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white"
          >
            Trusted by Creative Studios
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-base max-w-2xl"
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
          <p className="text-xs text-white/50 uppercase tracking-widest ">
            * Beta Program Feedback
          </p>
        </div>
      </div>
    </section>
  );
}
