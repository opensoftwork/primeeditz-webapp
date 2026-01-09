"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface NoProjectTypeStateProps {
  onBack: () => void;
}

export function NoProjectTypeState({ onBack }: NoProjectTypeStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-8"
    >
      <p className="text-white/40 font-medium">
        Please select a project type in Step 1 first.
      </p>
      <Button
        variant="outline"
        onClick={onBack}
        className="mt-6 h-11 px-8 font-black uppercase tracking-widest text-[10px] border-white/10 hover:bg-white/5 transition-all duration-300"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
      </Button>
    </motion.div>
  );
}
