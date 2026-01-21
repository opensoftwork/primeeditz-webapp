"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  disabled?: boolean;
}

export function ActionButton({
  href,
  icon,
  label,
  sublabel,
  disabled,
}: ActionButtonProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "h-auto flex-col items-start gap-4 p-6 rounded-2xl border border-white/5 bg-white/2 transition-all duration-300 w-full group/act overflow-hidden relative",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-white/5 hover:border-white/10 hover:-translate-y-1 shadow-lg"
      )}
      asChild={!disabled}
      disabled={disabled}
    >
      {disabled ? (
        <div className="w-full text-left">
          <InnerContent icon={icon} label={label} sublabel={sublabel} />
        </div>
      ) : (
        <Link href={href} className="w-full">
          <InnerContent icon={icon} label={label} sublabel={sublabel} />
          <ArrowRight className="absolute bottom-6 right-6 h-4 w-4 text-white/20 group-hover/act:text-indigo-400 group-hover/act:translate-x-1 transition-all" />
        </Link>
      )}
    </Button>
  );
}

function InnerContent({
  icon,
  label,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
}) {
  return (
    <>
      <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white group-hover/act:text-indigo-400 transition-colors">
        {icon}
      </div>
      <div className="space-y-1 text-left">
        <div className="text-[13px] font-black uppercase tracking-tight text-white">
          {label}
        </div>
        <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">
          {sublabel}
        </div>
      </div>
    </>
  );
}
