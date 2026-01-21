"use client";

import { motion } from "motion/react";
import { Film, Users } from "lucide-react";
import Link from "next/link";

export default function EmployeeOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500 selection:text-zinc-950">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-white border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <Film className="h-5 w-5 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-[0.3em] leading-none">
                PrimeEditz
              </span>
              <span className="text-[8px] font-bold text-indigo-400/60 uppercase tracking-widest mt-1">
                Team Onboarding
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Users className="h-4 w-4 text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest hidden sm:inline">
                Employee Portal
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-12">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-4">
          <div className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">
            PRIMEEDITZ POST-PRODUCTION STUDIO
          </div>
          <p className="text-[9px] font-medium text-white/20 max-w-md text-center">
            Welcome to the team! Complete your onboarding to access projects and
            start collaborating with the studio.
          </p>
        </div>
      </footer>
    </div>
  );
}
