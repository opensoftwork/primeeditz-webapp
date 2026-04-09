import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <div className="pt-10 border-t border-white/10">
      <div className="grid grid-cols-2 gap-4">
        <div className="group relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 p-5 transition-all hover:bg-white/[0.06] hover:border-indigo-500/30">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 shadow-inner">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
              Account
            </h4>
          </div>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-white/90 hover:text-indigo-400 transition-colors"
          >
            Sign In Instead
            <ArrowRight className="h-3 w-3 translate-y-[0.5px] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 p-5 transition-all hover:bg-white/[0.06] hover:border-indigo-500/30">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 shadow-inner">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
              Support
            </h4>
          </div>
          <p className="text-[11px] font-bold text-white/60 leading-none">
            Help Center
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-5 text-[8px] font-black uppercase tracking-[0.4em] text-white/20">
        <div className="h-px flex-1 bg-linear-to-r from-transparent to-white/10" />
        <span className="shrink-0">PrimeEditz Studio Console © 2026</span>
        <div className="h-px flex-1 bg-linear-to-l from-transparent to-white/10" />
      </div>
    </div>
  );
}
