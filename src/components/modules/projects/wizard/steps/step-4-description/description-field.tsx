"use client";

import React from "react";
import { FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface DescriptionFieldProps {
  form: any;
}

export function DescriptionField({ form }: DescriptionFieldProps) {
  return (
    <form.Field
      name="description"
      children={(field: any) => {
        const isInvalid =
          field.state.meta.isTouched && field.state.meta.errors.length > 0;
        return (
          <Field data-invalid={isInvalid}>
            <div className="flex items-center justify-between mb-3">
              <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Project Description{" "}
                <span className="text-white/20 ml-1 text-[10px] font-bold">
                  (Optional)
                </span>
              </FieldLabel>

              <div className="text-[10px] font-mono text-white/10 flex items-center gap-2">
                <span
                  className={cn(
                    "transition-colors",
                    (field.state.value?.length ?? 0) > 0
                      ? "text-primary/40"
                      : "text-white/10"
                  )}
                >
                  {field.state.value?.length ?? 0}
                </span>
              </div>
            </div>

            <FieldContent>
              <Textarea
                id="description"
                name={field.name}
                value={field.state.value ?? ""}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="Describe the creative vision, specific requirements, and overall vibe you want to achieve..."
                className="min-h-[160px] p-6 text-[15px] font-bold text-white bg-white/3 border-white/10 focus:border-primary/40 focus:ring-primary/20 transition-all rounded-2xl resize-none placeholder:text-white/10"
              />

              <AnimatePresence>
                {isInvalid && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 text-[10px] font-black uppercase tracking-widest text-destructive flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                    {field.state.meta.errors[0]}
                  </motion.div>
                )}
              </AnimatePresence>
            </FieldContent>
          </Field>
        );
      }}
    />
  );
}
