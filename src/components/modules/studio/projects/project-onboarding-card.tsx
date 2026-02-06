"use client";

import { ArrowRight, Info, Rocket, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProjectOnboardingCardProps {
  project: {
    _id: string;
    actionState: string;
  };
  className?: string;
}

export function ProjectOnboardingCard({
  project,
  className,
}: ProjectOnboardingCardProps) {
  const isAwaitingUploads = project.actionState === "awaiting_uploads";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative overflow-hidden rounded-4xl border border-primary/20 bg-primary/5 p-6",
        className,
      )}
    >
      {/* Background Accents */}
      <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 blur-[80px] rounded-full translate-x-24 -translate-y-12" />
      <div className="absolute bottom-0 left-0 h-24 w-24 bg-white/5 blur-[60px] rounded-full -translate-x-12 translate-y-12" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        {/* Icon / Status */}
        <div className="shrink-0 relative">
          <div className="h-16 w-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center relative z-10">
            <Rocket className="h-7 w-7 text-primary" />
          </div>
          {/* Pulse Effect */}
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-md animate-pulse" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3 text-center md:text-left">
          <div className="space-y-0.5">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">
                Action Required
              </span>
              <div className="h-1 w-1 rounded-full bg-primary/40" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
                Setup Protocol
              </span>
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white">
              {isAwaitingUploads
                ? "Initiate Asset Intake"
                : "Initialize Project Manifest"}
            </h3>
          </div>

          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed max-w-sm">
            {isAwaitingUploads
              ? "Your project is ready for files. Please upload your photos, videos or documents to the asset vault to begin production."
              : "Your project manifest is ready. Please upload reference files and technical notes to initiate the creative protocol."}
          </p>

          {/* Checklist */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            {[
              { icon: ShieldCheck, label: "Asset Vault" },
              { icon: Info, label: "Creative Brief" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-950/40 border border-white/5"
              >
                <item.icon className="h-2.5 w-2.5 text-white/40" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white/60">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="shrink-0 w-full md:w-auto">
          <Link
            href={
              isAwaitingUploads
                ? `/projects/${project._id}`
                : `/projects/${project._id}/onboarding`
            }
          >
            <Button className="w-full md:w-auto h-12 px-6 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_15px_30px_rgba(var(--primary),0.2)] gap-2 group border-0">
              {isAwaitingUploads ? "Explore Project" : "Complete Onboarding"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
