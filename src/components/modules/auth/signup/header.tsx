import { Crown } from "lucide-react";
import { motion } from "motion/react";

interface HeaderProps {
  isSetupMode: boolean;
  isAuthenticated: boolean;
}

export function Header({ isSetupMode, isAuthenticated }: HeaderProps) {
  return (
    <div className="space-y-14">
      {/* Setup Badge */}
      {isSetupMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-widest"
        >
          <Crown className="w-3 h-3" />
          <span>
            {isAuthenticated ? "Complete Admin Setup" : "Initial Admin Setup"}
          </span>
        </motion.div>
      )}

      {/* Header Text */}
      <div className="space-y-3 text-center lg:text-left">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 block">
          {isSetupMode ? "FOUNDATION SETUP" : "START YOUR JOURNEY"}
        </span>
        <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-none">
          {isSetupMode
            ? isAuthenticated
              ? "COMPLETE SETUP"
              : "INITIALIZE"
            : "JOIN STUDIO"}
        </h1>
        <p className="text-sm font-medium text-white/40 leading-relaxed max-w-[360px] mx-auto lg:mx-0">
          {isSetupMode
            ? isAuthenticated
              ? "Welcome back! Please provide your studio details to finish initializing the admin console."
              : "Create the master admin account to initialize your PrimeEditz studio instance."
            : "Create your account to start managing projects and collaborating with the team."}
        </p>
      </div>
    </div>
  );
}
