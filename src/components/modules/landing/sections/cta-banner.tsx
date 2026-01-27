"use client";

import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Main Component ---

export function CTABannerSection() {
  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="relative max-w-4xl mx-auto">
        {/* Banner Container - Glassmorphic Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className={cn(
            "relative rounded-3xl overflow-hidden",
            "border border-white/10",
            "bg-white/5 backdrop-blur-sm",
            "p-10 sm:p-14 lg:p-16",
            "text-center",
          )}
        >
          {/* Subtle glow effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200px] h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10"
            >
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-cyan-400">
                Start Today
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
            >
              Ready to Transform Your{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-pink-400">
                Workflow
              </span>
              ?
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base text-muted-foreground max-w-xl mx-auto"
            >
              Join creative studios saving hours every week with streamlined
              post-production management.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 mt-4"
            >
              {/* Primary CTA */}
              <Button
                asChild
                size="lg"
                className={cn(
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "font-bold px-8 py-6 text-base rounded-xl",
                  "shadow-lg shadow-primary/20",
                  "transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-105",
                )}
              >
                <Link href="/sign-up" className="flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>

              {/* Secondary CTA */}
              <Button
                asChild
                variant="outline"
                size="lg"
                className={cn(
                  "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20",
                  "font-semibold px-8 py-6 text-base rounded-xl",
                  "transition-all duration-300",
                )}
              >
                <Link href="/contact" className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule Demo
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
