"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";

interface WizardLoadingStateProps {
  isLoading: boolean;
  delay?: number;
  children: React.ReactNode;
}

export function WizardLoadingState({
  isLoading,
  delay = 1000,
  children,
}: WizardLoadingStateProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => {
        setShouldShow(true);
      }, delay);
    } else {
      setShouldShow(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && shouldShow ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center py-20 min-h-[400px] w-full"
        >
          <div className="relative flex items-center justify-center">
            {/* Outer Pulse */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute h-16 w-16 rounded-full bg-primary"
            />

            {/* Inner Spinner */}
            <div className="relative bg-background rounded-full p-3 border border-border/50 shadow-xl">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-center"
          >
            <h3 className="text-sm font-bold tracking-widest text-foreground uppercase">
              Initializing Step
            </h3>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">
              Preparing your workspace environment...
            </p>
          </motion.div>
        </motion.div>
      ) : !isLoading ? (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full"
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
