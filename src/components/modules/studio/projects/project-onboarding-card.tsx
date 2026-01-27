"use client";

import { Rocket, Info, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProjectOnboardingCardProps {
  projectId: string;
  className?: string;
}

export function ProjectOnboardingCard({
  projectId,
  className,
}: ProjectOnboardingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-primary/5 p-8",
        className,
      )}
    >
      {/* Background Accents */}
      <div className="absolute top-0 right-0 h-48 w-48 bg-primary/10 blur-[80px] rounded-full translate-x-24 -translate-y-12" />
      <div className="absolute bottom-0 left-0 h-32 w-32 bg-white/5 blur-[60px] rounded-full -translate-x-12 translate-y-12" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        {/* Icon / Status */}
        <div className="shrink-0 relative">
          <div className="h-20 w-20 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center relative z-10">
            <Rocket className="h-10 w-10 text-primary" />
          </div>
          {/* Pulse Effect */}
          <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-md animate-pulse" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                Action Required
              </span>
              <div className="h-1 w-1 rounded-full bg-primary/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                Setup Protocol
              </span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-white">
              Initialize Project Manifest
            </h3>
          </div>

          <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest leading-relaxed max-w-md">
            Your project manifest is ready. Please upload reference files and
            technical notes to initiate the creative protocol.
          </p>

          {/* Checklist */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
            {[
              { icon: ShieldCheck, label: "Asset Vault" },
              { icon: Info, label: "Creative Brief" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5"
              >
                <item.icon className="h-3 w-3 text-white/40" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="shrink-0 w-full md:w-auto">
          <Link href={`/projects/${projectId}/onboarding`}>
            <Button className="w-full md:w-auto h-14 px-8 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(var(--primary),0.2)] gap-3 group">
              Complete Onboarding
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
